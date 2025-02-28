const fs = require('fs').promises
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateColumns, validateFields, validateConfig, validateMultiConfig } = require('./config.js')

class AnalysationError extends Error {
    constructor(filename, worksheet, message) {
        super(message)
        this.name = 'AnalysationError'
        this.filename = filename
        this.worksheet = worksheet
    }
}
class ParsingError extends Error {
    constructor(filename, message) {
        super(message)
        this.name = 'ParsingError'
        this.filename = filename
    }
}

class FileNotExists extends Error {
    constructor(filename) {
        super(`File: '${filename}' doesn't exists.`)
        this.name = 'FileNotExists'
    }
}

class ConfigInvalid extends AnalysationError {
    constructor(errors, { worksheet = '', filename = '' } = {}) {
        super(filename, worksheet, 'Config is invalid.')
        this.name = 'ConfigInvalid'
        this.errors = errors
    }
}

class SheetMissing extends AnalysationError {
    constructor(filename, worksheet) {
        super(filename, worksheet, `Worksheet: '${worksheet}' is missing.`)
        this.name = 'SheetMissing'
    }
}

class InconsistentSheetName extends AnalysationError {
    constructor(filename, sheetName, config) {
        super(filename, config.worksheet, `Worksheet: '${config.worksheet}' is present but named inconsistent.`)
        this.name = 'InconsistentSheetName'
        this.key = 'worksheet'
        this.sheetName = sheetName
    }
}

class InconsistentHeaderName extends AnalysationError {
    constructor(filename, worksheet, key, header) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header for: '${key}' is present but named inconsistent.`)
        this.name = 'InconsistentHeaderName'
        this.key = key
        this.header = header
    }
}
class IncorrectColumnIndex extends AnalysationError {
    constructor(filename, worksheet, key, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' column index: '${key}' seems to be: ${index}.`)
        this.name = 'IncorrectColumnIndex'
        this.key = key
        this.index = index
    }
}

class IncorrectRowIndex extends AnalysationError {
    constructor(filename, worksheet, key, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' row index: '${key}' seems to be: ${index}.`)
        this.name = 'IncorrectRowIndex'
        this.key = key
        this.index = index
    }
}

class MissingDataHeader extends AnalysationError {
    constructor(filename, worksheet, key, header) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header for: '${key}' is missing.`)
        this.name = 'MissingDataHeader'
        this.key = key
        this.header = header
    }
}

class DataHeaderNotInConfig extends AnalysationError {
    constructor(filename, worksheet, header, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header: '${header.replace('\n', '\\n')}' not in config.`)
        this.name = 'DataHeaderNotInConfig'
        this.header = header
        this.index = index
    }
}

class InvalidData extends AnalysationError {
    constructor(filename, worksheet, key) {
        super(filename, worksheet, `Worksheet: '${worksheet}' key: '${key}' contains invalid data.`)
        this.name = 'InvalidData'
        this.key = key
    }
}

class Errors {
    static AnalysationError = AnalysationError
    static ParsingError = ParsingError
    static FileNotExists = FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentHeaderName = InconsistentHeaderName
    static InconsistentSheetName = InconsistentSheetName
    static IncorrectColumnIndex = IncorrectColumnIndex
    static IncorrectRowIndex = IncorrectRowIndex
    static MissingDataHeader = MissingDataHeader
    static DataHeaderNotInConfig = DataHeaderNotInConfig
    static InvalidData = InvalidData
}

/**
 * Adapt a configuration to an invalid configured file
 * @param {Object} config to adapt to the file
 * @param {Array} errors to change the configuration
 * @returns {Object} a new object with the changed parameters
 */
function adapt(config, errors) {
    const adaption = Object.assign({}, config)
    // validate config and use the results as flags
    const isColumns = validateColumns(config)
    const isFields = validateFields(config)
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    switch (true) {
        case !isColumns && !isFields && !isConfig && !isMultiConfig:
            // configuration error
            throw new ConfigInvalid([...validateColumns.errors, ...validateFields.errors, ...validateConfig.errors, ...validateMultiConfig.errors])

        case !isColumns && !isFields && !isConfig:
            // adapt a multi config
            for (const key in adaption) {
                const subConfig = adaption[key]
                const noSheet = errors.find(function (error) {
                    return error.name === 'SheetMissing' && error.worksheet === subConfig.worksheet
                })
                if (noSheet) {
                    delete adaption[key]
                } else {
                    adaption[key] = adapt(subConfig, errors)
                }
            }
            break

        case !isColumns && !isFields:
            // adapt a single config
            const invalidName = errors.find(function (error) {
                return error.name === 'InconsistentSheetName' && error.worksheet === config.worksheet
            })
            if (invalidName) adaption.worksheet = invalidName.actual
            const invalidRowOffset = errors.find(function (error) {
                return error.name === 'IncorrectRowOffset' && error.worksheet === adaption.worksheet
            })
            if (invalidRowOffset) adaption.rowOffset = invalidRowOffset.actual
            if (adaption.columns) {
                // adapt columns
                for (let cCnt = 0; cCnt < adaption.columns.length; cCnt++) {
                    const column = adaption.columns[cCnt]
                    const invalidColIndex = errors.find(function (error) {
                        return error.name === 'IncorrectColumnIndex' && error.key === column.key
                    })
                    if (invalidColIndex) column.index = invalidColIndex.actual
                }
                // TODO : missing data headers
                const missingDataHeaders = errors.filter(function (error) {
                    return error.name === 'MissingDataHeader'
                })
            } else {
            }
            // TODO : strategy for adapting empty values? set to zero or null string
            break
    }

    return adaption
}
/**
 * Analyze a *.xlsx file by a given configuration. Returning the differences as errors.
 * @param {String} filename a string containing path and filename for the workbook to be analyzed
 * @param {Object} config an object holding the configuration the file is analyzed against
 * @param {Object} [options]
 * @param {Number} [options.sheetMissingThreshold] fuzzy search threshold to determine missing sheets
 * @param {Number} [options.inconsistentSheetNameScore] fuzzy search score to determine inconsistent sheet names
 * @param {Number} [options.missingHeaderThreshold] fuzzy search threshold to determine missing headers
 * @param {Number} [options.inconsistentHeaderScore] fuzzy search score to determine inconsistent headers
 * @param {Number} [options.rowDeviation] allowed row deviation to be considered a match
 * @param {Number} [options.colDeviation] allowed col deviation to be considered a match
 * @returns {[AnalysationError]} errors
 */
async function analyze(
    filename,
    config,
    {
        sheetMissingThreshold = 0.2,
        inconsistentSheetNameScore = 0.001,
        missingHeaderThreshold = 0.2,
        inconsistentHeaderScore = 0.001,
        incorrectHeaderDistance = 6
    } = {}
) {
    // check file access
    try {
        await fs.access(filename, fs.constants.W_OK | fs.constants.R_OK)
    } catch (error) {
        throw new FileNotExists(filename)
    }
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
            // 1. read the file
            const workbook = new ExcelJS.Workbook()
            try {
                await workbook.xlsx.readFile(filename)
            } catch (error) {
                // early break out the switch statement, because we cannot access the file
                errors.push(error)
                break
            }
            // 2. check if sheet is present
            const findSheet = new Fuse(workbook.worksheets, {
                includeScore: true,
                threshold: sheetMissingThreshold,
                keys: ['name']
            })
            const searchSheet = findSheet.search(config.worksheet)
            if (searchSheet.length === 0) {
                errors.push(new SheetMissing(filename, config.worksheet))
                // early break out the switch statement, because the sheet can't be accessed
                break
            }
            // pick the first sheet
            const { item: sheet, score: sheetNameScore } = searchSheet[0]
            if (sheetNameScore >= inconsistentSheetNameScore) {
                errors.push(new InconsistentSheetName(filename, sheet.name, config))
            }
            if (sheet.lastRow === undefined && sheet.lastColumn === undefined) {
                // early break out the switch statement, if the sheet is empty
                break
            }
            // 3. check if fields or columns are present
            // FIXME : optimize program flow check fields and columns length before initializing the search
            // FIXME : empty merged cells produce an error when trying to create a fuse index
            // FIXME : make the error check in the loop more robust if possible
            const data = []
            sheet.eachRow(function (row) {
                row.eachCell(function (cell) {
                    try {
                        // the next statement is the actual error check
                        // if we can't access the text property of a cell
                        // it will be filtered out of our data
                        const check = cell.text
                        data.push(cell)
                    } catch (error) {}
                })
            })
            const sheetIndex = Fuse.createIndex(['text'], data)
            const sheetFuse = new Fuse(
                data,
                {
                    includeScore: true,
                    keys: ['text']
                },
                sheetIndex
            )
            if (config.type === 'object') {
                // early break out the switch statement, if we cannot make any search
                if (config.fields.length === 0) break
                // start searching
                for (let fieldIndex = 0; fieldIndex < config.fields.length; fieldIndex++) {
                    const field = config.fields[fieldIndex]
                    if (!field.header) continue
                    const searchObjectHeader = sheetFuse.search(field.header.text)
                    let found = false
                    for (let matchIndex = 0; matchIndex < searchObjectHeader.length; matchIndex++) {
                        const match = searchObjectHeader[matchIndex]
                        const { item: cell } = match
                        const rowError = cell.row - field.header.row
                        const colError = cell.col - field.header.col
                        const manhattanDistance = Math.abs(rowError) + Math.abs(colError)
                        if (manhattanDistance < incorrectHeaderDistance && match.score < missingHeaderThreshold) {
                            found = true
                            if (match.score >= inconsistentHeaderScore) {
                                errors.push(new InconsistentHeaderName(filename, sheet.name, field.key, cell.text))
                            }
                            if (rowError !== 0) errors.push(new IncorrectRowIndex(filename, sheet.name, field.key, field.header.row + rowError))
                            if (colError !== 0) errors.push(new IncorrectColumnIndex(filename, sheet.name, field.key, field.header.col + colError))
                        }
                    }
                    if (!found) {
                        errors.push(new MissingDataHeader(filename, sheet.name, field.key, field.header.text))
                    }
                }
            } else if (config.type === 'list') {
                // early break out the switch statement, if we cannot make any search
                if (config.columns.length === 0) break
                // start searching
                for (let columnIndex = 0; columnIndex < config.columns.length; columnIndex++) {
                    const column = config.columns[columnIndex]
                    if (!column.header) continue
                    const searchColumn = sheetFuse.search(column.header)
                    let found = false
                    for (let searchIndex = 0; searchIndex < searchColumn.length; searchIndex++) {
                        const match = searchColumn[searchIndex]
                        const { item: cell } = match
                        const rowError = cell.row - config.rowOffset
                        const colError = cell.col - column.index
                        const manhattanDistance = Math.abs(rowError) + Math.abs(colError)
                        if (manhattanDistance < incorrectHeaderDistance && match.score < missingHeaderThreshold) {
                            found = true
                            if (match.score >= inconsistentHeaderScore) {
                                errors.push(new InconsistentHeaderName(filename, sheet.name, column.key, cell.text))
                            }
                            if (rowError !== 0) errors.push(new IncorrectRowIndex(filename, sheet.name, column.key, config.rowOffset + rowError))
                            if (colError !== 0) errors.push(new IncorrectColumnIndex(filename, sheet.name, column.key, column.index + colError))
                        }
                    }
                    if (!found) {
                        errors.push(new MissingDataHeader(filename, sheet.name, column.key, column.header))
                    }
                }
            }
            break
    }
    return errors
}

/**
 * Parse a *.xlsx file into a data object.
 * @param {String} filename
 * @param {Object} config
 */
async function parse(filename, config) {
    // check file access
    try {
        await fs.access(filename, fs.constants.W_OK | fs.constants.R_OK)
    } catch (error) {
        throw new FileNotExists(filename)
    }
    //
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filename)
    const result = {}
    for (const key in config) {
        const { worksheet: sheetName, type } = config[key]
        console.log({ key, sheetName, type })
        const worksheet = workbook.getWorksheet(sheetName)
        if (!worksheet) throw new ParsingError(filename, `Sheet ${sheetName} does not exist.`)
        if (type === 'object') {
            result[key] = {}
            for (const field of config[key].fields) {
                result[key][field.key] = worksheet.getRow(field.row).getCell(field.col).value
            }
        } else if (type === 'list') {
            result[key] = []
            const columns = config[key].columns
            const rowOffset = config[key].rowOffset
            const colOffset = columns[0].index
            const headers = worksheet.getRow(rowOffset).values
            console.log({ rowOffset, colOffset })
            console.log(headers)
            const rows = worksheet.getRows(rowOffset + 1, columns.length)
            for (const row of rows) {
                console.log(row.values)
                const item = {}
                for (let index = colOffset; index < headers.length; index++) {
                    item[headers[index]] = row.getCell(index).value
                }
                result[key].push(item)
            }
        }
    }
    return result
}

async function read(filename) {
    let workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filename)
    let result = {}
    for (let sheetIndex = 0; sheetIndex < workbook.worksheets.length; sheetIndex++) {
        const worksheet = workbook.worksheets[sheetIndex]
        const data = {
            name: worksheet.name,
            lastRow: worksheet.lastRow?.number || -1,
            lastColumn: worksheet.lastColumn?.number || -1
        }
        result[worksheet.name] = data
    }
    return result
}

/**
 * Validate a *.xlsx files data against a configuration. Returning invalid data points.
 * @param {String} filename
 * @param {Object} config
 */
function validate(filename, config) {}

module.exports = {
    adapt,
    analyze,
    read,
    parse,
    Errors
}
