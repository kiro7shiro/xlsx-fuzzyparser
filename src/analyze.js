const fs = require('fs').promises
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateConfig, validateMultiConfig } = require('./config.js')
const { loadIndex, getWorksheetData } = require('./files.js')

// TODO : add a MixedRowIndex error for cases where multiple list headers are miss placed vertically
// TODO : support for horizontal lists ???
class AnalysationError extends Error {
    constructor(filename, message) {
        super(message)
        this.filename = filename
    }
}

class FileNotExists extends Error {
    constructor(filename) {
        super(`File: '${filename}' doesn't exists.`)
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

class InvalidData extends AnalysationError {
    constructor(filename, worksheet, key) {
        super(filename, `Worksheet: '${worksheet}' key: '${key}' contains invalid data.`)
        this.key = key
    }
}

class Errors {
    static AnalysationError = AnalysationError
    static FileNotExists = FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentHeaderName = InconsistentHeaderName
    static InconsistentSheetName = InconsistentSheetName
    static IncorrectColumnIndex = IncorrectColumnIndex
    static IncorrectRowIndex = IncorrectRowIndex
    static MissingDataHeader = MissingDataHeader
    static InvalidData = InvalidData
}

let workbook = null
let workbookName = null

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
        incorrectDistance = 6,
        sheetEngineOptions = {
            includeScore: true,
            isCaseSensitive: true,
            threshold: 0.4,
            keys: ['name']
        },
        headEngineOptions = {
            includeScore: true,
            isCaseSensitive: true,
            threshold: 0.4,
            keys: ['text']
        }
    } = {}
) {
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
            // early break out the switch statement, because we cannot read the file
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
            // 4. search descriptors
            for (let descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                const descriptor = descriptors[descriptorIndex]
                if (!Object.hasOwn(descriptor, 'header')) continue
                if (!Array.isArray(descriptor.header)) continue
                if (descriptor.header.length === 0) continue
                let results = []
                for (let headerIndex = 0; headerIndex < descriptor.header.length; headerIndex++) {
                    const header = descriptor.header[headerIndex]
                    //console.log(header)
                    const headEngine = new Fuse(data, Object.assign({}, headEngineOptions, { distance: header.text.length }), sheetIndex)
                    let matches = headEngine.search(header.text)
                    //console.table(matches)
                    matches = matches
                        .reduce(function (accu, match) {
                            match.rowError = match.item.row - header.row
                            match.colError = match.item.col - header.col
                            match.text = match.item.text
                            //match.address = `R${match.item.row}C${match.item.col}`
                            match.distance = Math.abs(match.rowError) + Math.abs(match.colError)
                            if (match.distance < incorrectDistance) accu.push(match)
                            return accu
                        }, [])
                        .sort(function (a, b) {
                            if (a.score === b.score) return a.distance - b.distance
                            return 0
                        })
                    if (matches.length === 0) {
                        // TODO : check if a data value is present
                        errors.push(new MissingDataHeader(filename, sheet.name, descriptor.key, header.text, headerIndex))
                        continue
                    }
                    //console.table(matches)
                    // pick the first match as result
                    const result = matches[0]
                    result.index = headerIndex
                    results.push(result)
                }
                //console.table(results)
                // TODO : if config.type === list check if columns are in a straight line horizontally or vertically
                // TODO : check if multi cell headers are in line horizontally or vertically
                // TODO : add a header identifier to row and col errors
                for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
                    const result = results[resultIndex]
                    if (result.score >= inconsistentScore)
                        errors.push(new InconsistentHeaderName(filename, sheet.name, descriptor.key, result.text, result.index))
                    if (result.rowError !== 0)
                        errors.push(
                            new IncorrectRowIndex(filename, sheet.name, descriptor.key, descriptor.header[resultIndex].row + result.rowError, result.index)
                        )
                    if (result.colError !== 0)
                        errors.push(
                            new IncorrectColumnIndex(filename, sheet.name, descriptor.key, descriptor.header[resultIndex].col + result.colError, result.index)
                        )
                }
            }
            break
    }
    return errors
}

module.exports = {
    analyze,
    Errors
}
