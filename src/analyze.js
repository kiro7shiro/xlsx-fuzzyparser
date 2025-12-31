/**
 * Module for analyzing excel files against a config.
 */

// TODO
// [ ] : add a MixedRowIndex error for cases where multiple list headers are miss placed vertically
// [ ] : support for horizontal lists ???

const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateConfig, validateMultiConfig } = require('./config.js')
const { loadIndex, getWorkbook, getWorksheetData, Errors: FilesErrors } = require('./files.js')

class AnalysationError {
    constructor(filename, message) {
        this.filename = filename
        this.message = message
    }
}

class ConfigInvalid extends AnalysationError {
    constructor(errors, { filename = '' } = {}) {
        super(filename, 'Config is invalid.')
        this.errors = errors
    }
}

class SheetMissing extends AnalysationError {
    constructor(filename, worksheet) {
        super(filename, worksheet, `Worksheet: '${worksheet}' is missing.`)
        this.worksheet = worksheet
    }
}

class InconsistentSheetName extends AnalysationError {
    constructor(filename, inconsistentName, config) {
        super(filename, config.worksheet, `Worksheet: '${config.worksheet}' is present but named inconsistent.`)
        this.worksheet = config.worksheet
        this.inconsistentName = inconsistentName
    }
}

class InconsistentHeaderName extends AnalysationError {
    constructor(filename, worksheet, key, header, index) {
        super(filename, `Worksheet: '${worksheet}' data header for: '${key}' is present but named inconsistent.`)
        this.key = key
        this.header = header
        this.index = index
    }
}
class IncorrectHeaderColumn extends AnalysationError {
    constructor(filename, worksheet, key, column, header) {
        super(filename, `Worksheet: '${worksheet}' column index: '${key}' seems to be: ${column}.`)
        this.key = key
        this.column = column
        this.header = header
    }
}

class IncorrectHeaderRow extends AnalysationError {
    constructor(filename, worksheet, key, row, header) {
        super(filename, `Worksheet: '${worksheet}' row index: '${key}' seems to be: ${row}.`)
        this.key = key
        this.row = row
        this.header = header
    }
}

class MissingDataHeader extends AnalysationError {
    constructor(filename, worksheet, key, header, index) {
        super(filename, `Worksheet: '${worksheet}' data header for: '${key}' is missing.`)
        this.key = key
        this.header = header
        this.index = index
    }
}

class EmptyDataCell extends AnalysationError {
    constructor(filename, worksheet, key) {
        super(filename, `Worksheet: '${worksheet}' data cell for: '${key}' is empty.`)
        this.key = key
    }
}

// TODO : maybe split up config and file related errors into their own modules (ConfigErrors, FileErrors)
class Errors {
    static AnalysationError = AnalysationError
    static FileNotExists = FilesErrors.FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentSheetName = InconsistentSheetName
    static InconsistentHeaderName = InconsistentHeaderName
    static IncorrectHeaderColumn = IncorrectHeaderColumn
    static IncorrectHeaderRow = IncorrectHeaderRow
    static MissingDataHeader = MissingDataHeader
    static EmptyDataCell = EmptyDataCell
}

// TODO : add the ability to accept strings for pointing to a config file
/**
 * Analyze a *.xlsx file by a given configuration. Returning the differences as errors.
 * @param {String} filename a string containing path and filename for the workbook to be analyzed
 * @param {Object} config an object holding the configuration the file is analyzed against
 * @param {Object} [options]
 * @param {Number} [options.inconsistentScore] fuzzy search score to determine inconsistency
 * @param {Number} [options.incorrectDistance] distance above a descriptor is considered missing
 * @param {Object} [options.sheetEngineOptions] fuzzy search options for searching sheet names
 * @param {Object} [options.headEngineOptions] fuzzy search options for searching a descriptors header
 * @returns {[AnalysationError]} errors
 */
async function analyze(
    filename,
    config,
    {
        inconsistentScore = 0.001,
        missingScore = 0.5,
        incorrectDistance = 4,
        sheetEngineOptions = {
            includeScore: true,
            isCaseSensitive: true,
            keys: ['name']
        },
        headEngineOptions = {
            includeScore: true,
            isCaseSensitive: true,
            keys: ['text']
        }
    } = {}
) {
    const workbook = await getWorkbook(filename, {
        create: false,
        ignoreNodes: [
            'sheetPr',
            'dimension',
            'sheetViews',
            'sheetFormatPr',
            //'cols',
            //'sheetData',
            'autoFilter',
            //'mergeCells',
            'rowBreaks',
            'hyperlinks',
            'pageMargins',
            'dataValidations',
            'pageSetup',
            'headerFooter',
            'printOptions',
            'picture',
            'drawing',
            'sheetProtection',
            'tableParts',
            'conditionalFormatting',
            'extLst'
        ]
    })
    // analyze config and use results as flags
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    // test the file based on the config by trying to access the data
    const errors = []
    switch (true) {
        case !isConfig && !isMultiConfig:
            throw new ConfigInvalid([...validateConfig.errors, ...validateMultiConfig.errors])

        case isMultiConfig:
            // analyze a multi config
            for (const key in config) {
                const subConfig = config[key]
                errors.push(...(await analyze(filename, subConfig)))
            }
            break
        case isConfig:
            // analyze a single config
            // 1. load index file
            const fileIndex = await loadIndex(filename, { sheetKeys: sheetEngineOptions.keys, cellKeys: headEngineOptions.keys })
            // 2. check if sheet is present
            let sheetNamesIndex = null
            if (Object.hasOwn(fileIndex, 'sheetNamesIndex')) {
                sheetNamesIndex = fileIndex['sheetNamesIndex']
            } else {
                sheetNamesIndex = Fuse.createIndex(sheetEngineOptions.keys, workbook.worksheets)
            }
            const sheetEngine = new Fuse(workbook.worksheets, sheetEngineOptions, sheetNamesIndex)
            const searchSheet = sheetEngine.search(config.worksheet)
            if (searchSheet.length === 0) {
                errors.push(new SheetMissing(filename, config.worksheet))
                // early break out the switch statement, because the sheet can't be accessed
                break
            }
            // pick the first sheet as the match
            const { item: sheet, score: sheetNameScore } = searchSheet[0]
            if (sheetNameScore >= inconsistentScore) {
                errors.push(new InconsistentSheetName(filename, sheet.name, config))
            }
            if (sheet.lastRow === undefined && sheet.lastColumn === undefined) {
                // early break out the switch statement, if the sheet is empty
                break
            }
            // 3. check if fields or columns are present
            const descriptors = config.type === 'object' ? config.fields : config.columns
            // early break out the switch statement, if we cannot make any search
            if (descriptors.length === 0) break
            // load sheet data and sheet index
            const data = getWorksheetData(sheet)
            let sheetIndex = null
            if (Object.hasOwn(fileIndex, sheet.name)) {
                sheetIndex = fileIndex[sheet.name]
            } else {
                sheetIndex = Fuse.createIndex(headEngineOptions.keys, data)
            }
            // 4. search for descriptors
            const headEngine = new Fuse(data, headEngineOptions, sheetIndex)
            for (let descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                const descriptor = descriptors[descriptorIndex]
                if (!Object.hasOwn(descriptor, 'header')) continue
                if (!Array.isArray(descriptor.header)) continue
                if (descriptor.header.length === 0) continue
                let results = []
                for (let headerIndex = 0; headerIndex < descriptor.header.length; headerIndex++) {
                    const header = descriptor.header[headerIndex]
                    const sideHeaders = descriptor.header.reduce(function (a, c, i) {
                        if (i === headerIndex) return a
                        a.push(c)
                        return a
                    }, [])
                    //console.log(tIndex)
                    //console.log(header)
                    // 4.1 search descriptor header
                    let matches = headEngine.search(header.text)
                    //console.table(matches)
                    matches = matches
                        .reduce(function (accu, match) {
                            match.rowError = match.item.row - header.row
                            match.colError = match.item.col - header.col
                            match.text = match.item.text
                            match.distance = Math.abs(match.rowError) + Math.abs(match.colError)
                            // don't allow exact matches of side by side headers
                            if (sideHeaders.some((h) => h.text === match.text)) return accu
                            //
                            if (match.score < missingScore && match.distance < incorrectDistance) accu.push(match)
                            return accu
                        }, [])
                        .sort(function (a, b) {
                            if (a.distance === b.distance) return a.score - b.score
                            return a.distance - b.distance
                        })
                    if (matches.length === 0) {
                        errors.push(new MissingDataHeader(filename, sheet.name, descriptor.key, header.text, headerIndex))
                        continue
                    }
                    //console.table(matches)
                    // pick the first match as result
                    const result = matches[0]
                    result.index = headerIndex
                    results.push(result)
                }
                //console.log('descriptor results:')
                //console.table(results)
                // 4.2 analyze descriptor results
                for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
                    const result = results[resultIndex]
                    if (result.score >= inconsistentScore)
                        errors.push(new InconsistentHeaderName(filename, sheet.name, descriptor.key, result.text, result.index))
                    if (result.rowError !== 0)
                        errors.push(
                            new IncorrectHeaderRow(filename, sheet.name, descriptor.key, descriptor.header[resultIndex].row + result.rowError, result.index)
                        )
                    if (result.colError !== 0)
                        errors.push(
                            new IncorrectHeaderColumn(filename, sheet.name, descriptor.key, descriptor.header[resultIndex].col + result.colError, result.index)
                        )
                }
                // 5. search the descriptors value cell and check if it's not empty
                // just make sure there is one cell that contains possible data
                // after that we have enough information for a possible recovery
                // 5.1 get original value cell position from config
                const valueRow = config.type === 'object' ? descriptor.row : config.row
                const valueColumn = config.type === 'object' ? descriptor.col : descriptor.index
                const cell = sheet.getRow(valueRow).getCell(valueColumn)
                // 5.2 calc alternate positions if incorrect header row or column indices are present
                const incorrectIndices = errors.filter(function (error) {
                    return (error instanceof IncorrectHeaderRow || error instanceof IncorrectHeaderColumn) && error.key === descriptor.key
                })
                if (incorrectIndices.length < 1) {
                    if (cell.type === ExcelJS.ValueType.Null) {
                        errors.push(new EmptyDataCell(filename, sheet.name, descriptor.key))
                    }
                    // at this point assume a valid data cell that contains some data we do not know jet, do nothing
                } else {
                    // 5.3 check alternate positions
                    // TODO : all alternate positions of one descriptors header should point to the same cell
                    const notEmpty = []
                    if (cell.type !== ExcelJS.ValueType.Null) {
                        notEmpty.push(cell)
                    }
                    for (let eCnt = 0; eCnt < incorrectIndices.length; eCnt++) {
                        const error = incorrectIndices[eCnt]
                        const header = descriptor.header[error.header]
                        const relativeRow = valueRow - header.row
                        const relativeColumn = valueColumn - header.col
                        const rowOffset = error instanceof IncorrectHeaderRow ? error.row - header.row : 0
                        const columnOffset = error instanceof IncorrectHeaderColumn ? error.column - header.col : 0
                        const alternateRow = header.row + rowOffset + relativeRow
                        const alternateColumn = header.col + columnOffset + relativeColumn
                        const alternateCell = sheet.getRow(alternateRow).getCell(alternateColumn)
                        //console.log(alternateCell)
                        //console.log(alternateCell.row, alternateCell.col)
                        if (alternateCell.type !== ExcelJS.ValueType.Null) {
                            notEmpty.push(alternateCell)
                        }
                    }
                    //console.log(notEmpty.length)
                    if (notEmpty.length < 1) {
                        errors.push(new EmptyDataCell(filename, sheet.name, descriptor.key))
                    }
                }
            }
            // this is the last analysation step! next adapt the config to the errors
            break
    }
    return errors
}

module.exports = {
    analyze,
    Errors
}
