/**
 * Module for analyzing excel files against a config.
 */

// TODO
// [ ] : add a MixedRowIndex error for cases where multiple list headers are miss placed vertically
// [ ] : support for horizontal lists ???

const fs = require('fs').promises
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateConfig, validateMultiConfig } = require('./config.js')
const { loadIndex, getWorksheetData } = require('./files.js')

class FileNotExists extends Error {
    constructor(filename) {
        super(`File: '${filename}' doesn't exists.`)
    }
}

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

class IncorrectHeaderRow extends AnalysationError {
    constructor(filename, worksheet, key, row, header) {
        super(filename, `Worksheet: '${worksheet}' header row for '${key}' seems to be: ${row}.`)
        this.key = key
        this.row = row
        this.header = header
    }
}

class IncorrectHeaderColumn extends AnalysationError {
    constructor(filename, worksheet, key, column, header) {
        super(filename, `Worksheet: '${worksheet}' header column for '${header}' seems to be: ${column}.`)
        this.key = key
        this.column = column
        this.header = header
    }
}

class IncorrectColumnIndex extends AnalysationError {
    constructor(filename, worksheet, key, column, header) {
        super(filename, `Worksheet: '${worksheet}' column index: '${key}' seems to be: ${column}.`)
        this.key = key
        this.column = column
        this.header = header
    }
}

class IncorrectRowIndex extends AnalysationError {
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
    static FileNotExists = FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentSheetName = InconsistentSheetName
    static InconsistentHeaderName = InconsistentHeaderName
    static IncorrectHeaderColumn = IncorrectHeaderColumn
    static IncorrectHeaderRow = IncorrectHeaderRow
    static IncorrectColumnIndex = IncorrectColumnIndex
    static IncorrectRowIndex = IncorrectRowIndex
    static MissingDataHeader = MissingDataHeader
    static EmptyDataCell = EmptyDataCell
}

// TODO : use getWorkbook() function to get the workbook as it has a built in chaching system
// TODO : implement a GLOBAL cache that can hold multiple workbooks
let workbook = null
let workbookName = null

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
    // TODO : use getWorkbook() function to get the workbook
    // check file access
    try {
        await fs.access(filename, fs.constants.W_OK | fs.constants.R_OK)
    } catch (error) {
        throw new FileNotExists(filename)
    }
    // read the file
    if (workbook === null || workbookName !== filename) {
        if (workbook === null) workbook = new ExcelJS.Workbook()
        try {
            await workbook.xlsx.readFile(filename, {
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
            workbookName = filename
        } catch (error) {
            // early break out because we cannot read the file
            errors.push(error)
            return errors
        }
    }
    // analyze config and use results as flags
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    // test the file based on the config by trying to access the data
    let errors = []
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
                            if (sideHeaders.some(h => h.text === match.text)) return accu
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
                console.log('descriptor results:')
                console.table(results)
                // TODO : combine errors of multiple headers from a single descriptor into one error
                // TODO : if config.type === list check if columns are in a straight line horizontally( or vertically)
                // TODO : check if multi cell headers are in order of their positions according to the config
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
                // TODO : this belongs to part 5.
                // 4.1 search descriptor value
                // 4.2 get position
                let valueRow = config.type === 'object' ? descriptor.row : config.row
                let valueColumn = config.type === 'object' ? descriptor.col : descriptor.index
                let cell = sheet.getRow(valueRow).getCell(valueColumn)
                // 4.3 calc alternate positions if possible
                const incorrectIndex = errors.filter(function (error) {
                    return (error instanceof IncorrectRowIndex || error instanceof IncorrectColumnIndex) && error.key === descriptor.key
                })
                // 4.4 check the value
                if (incorrectIndex.length < 1) {
                    if (cell.type === ExcelJS.ValueType.Null) {
                        errors.push(new EmptyDataCell(filename, sheet.name, descriptor.key))
                    }
                    // valid data cell that contains some data we do not know jet, do nothing
                } else {
                    // calc alternate positions
                    // all alternate positions of one descriptors header should point to the same cell
                    for (let eCnt = 0; eCnt < incorrectIndex.length; eCnt++) {
                        const error = incorrectIndex[eCnt]
                        const header = descriptor.header[error.header]
                        header.relativeRow = valueRow - header.row
                        header.relativeColumn = valueColumn - header.col
                        header.rowOffset = error instanceof IncorrectRowIndex ? error.row - header.row : 0
                        header.columnOffset = error instanceof IncorrectColumnIndex ? error.column - header.col : 0
                        header.alternateRow = header.row + header.rowOffset + header.relativeRow
                        header.alternateColumn = header.col + header.columnOffset + header.relativeColumn
                    }
                }
            }
            // 5. search value cell and check if it's not empty
            // 5.1 get value cell position from config
            // 5.2 calc alternate positions if incorrect header row or column indices are present
            // 5.3 check positions
            // what if original position and alternate position have a value?

            // this is the last analysation step! next adapt the config to the errors
            break
    }
    return errors
}

module.exports = {
    analyze,
    Errors
}
