const fs = require('fs').promises
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateColumns, validateFields, validateConfig, validateMultiConfig } = require('./xlsx-schema.js')

// TODO : rename to analysation error
// validation errors
class ValidationError extends Error {
    constructor(filename, worksheet, message) {
        super(message)
        this.name = 'ValidationError'
        this.filename = filename
        this.worksheet = worksheet
    }
}

class FileNotExists extends ValidationError {
    constructor(filename) {
        super(filename, null, `File: '${filename}' doesn't exists.`)
        this.name = 'FileNotExists'
    }
}

class ConfigInvalid extends ValidationError {
    constructor(errors, { worksheet = '', filename = '' } = {}) {
        super(filename, worksheet, 'Config is invalid.')
        this.name = 'ConfigInvalid'
        this.errors = errors
    }
}

class SheetMissing extends ValidationError {
    constructor(filename, worksheet) {
        super(filename, worksheet, `Worksheet: '${worksheet}' is missing.`)
        this.name = 'SheetMissing'
    }
}

class InconsistentSheetName extends ValidationError {
    constructor(filename, worksheet, config) {
        super(filename, config.worksheet, `Worksheet: '${config.worksheet}' is present but named inconsistent.`)
        this.name = 'InconsistentSheetName'
        this.key = 'worksheet'
        this.actual = worksheet
    }
}

class InconsistentHeaderName extends ValidationError {
    constructor(filename, worksheet, key, header) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header for: '${key}' is present but named inconsistent.`)
        this.name = 'InconsistentHeaderName'
        this.key = key
        this.header = header
    }
}

class ColumnHeadersMissing extends ValidationError {
    constructor(filename, worksheet) {
        super(filename, worksheet, `Worksheet: '${worksheet}' column headers are missing.`)
        this.name = 'ColumnHeadersMissing'
        this.key = 'columnHeaders'
    }
}

class IncorrectRowOffset extends ValidationError {
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: '${worksheet}' rowOffset seems to be: ${actual}.`)
        this.name = 'IncorrectRowOffset'
        this.key = key
        this.actual = actual
    }
}

class IncorrectColumnIndex extends ValidationError {
    constructor(filename, worksheet, key, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' column index: '${key}' seems to be: ${index}.`)
        this.name = 'IncorrectColumnIndex'
        this.key = key
        this.index = index
    }
}

class IncorrectRowIndex extends ValidationError {
    constructor(filename, worksheet, key, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' row index: '${key}' seems to be: ${index}.`)
        this.name = 'IncorrectRowIndex'
        this.key = key
        this.index = index
    }
}

class MissingDataHeader extends ValidationError {
    constructor(filename, worksheet, key, header) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header for: '${key}' is missing.`)
        this.name = 'MissingDataHeader'
        this.key = key
        this.header = header
    }
}

class DataHeaderNotInConfig extends ValidationError {
    constructor(filename, worksheet, header, index) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header: '${header.replace('\n', '\\n')}' not in config.`)
        this.name = 'DataHeaderNotInConfig'
        this.header = header
        this.index = index
    }
}

class InvalidData extends ValidationError {
    constructor(filename, worksheet, key) {
        super(filename, worksheet, `Worksheet: '${worksheet}' key: '${key}' contains invalid data.`)
        this.name = 'InvalidData'
        this.key = key
    }
}

class Errors {
    static ValidationError = ValidationError
    static FileNotExists = FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentHeaderName = InconsistentHeaderName
    static InconsistentSheetName = InconsistentSheetName
    static ColumnHeadersMissing = ColumnHeadersMissing
    static IncorrectRowOffset = IncorrectRowOffset
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

function searchListHeaders(sheet, config) {}

/**
 * Analyze a *.xlsx file by a given configuration. Returning the differences as errors.
 * @param {String} filename
 * @param {Object} config
 * @returns {[ValidationError]} errors
 */
async function analyze(
    filename,
    config,
    { sheetMissingThreshold = 0.2, inconsistentSheetNameScore = 0.001, missingHeaderThreshold = 0.2, inconsistentHeaderScore = 0.001 } = {}
) {
    // check file access
    try {
        await fs.access(filename, fs.constants.W_OK | fs.constants.R_OK)
    } catch (error) {
        throw new FileNotExists(filename)
    }
    // analyze config and use the results as flags
    const isColumns = validateColumns(config)
    const isFields = validateFields(config)
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    // test the file based on the config by trying to access the data
    const errors = []
    switch (true) {
        case !isColumns && !isFields && !isConfig && !isMultiConfig:
            throw new ConfigInvalid([...validateColumns.errors, ...validateFields.errors, ...validateConfig.errors, ...validateMultiConfig.errors])

        case !isColumns && !isFields && !isConfig:
            // analyze a multi config
            for (const key in config) {
                const subConfig = config[key]
                errors.push(...(await analyze(filename, subConfig)))
            }
            break

        case !isColumns && !isFields:
            // analyze a single config
            // 1. read file
            const workbook = new ExcelJS.Workbook()
            try {
                await workbook.xlsx.readFile(filename)
            } catch (error) {
                errors.push(error)
                // early break out the switch statement, because we cannot access the file
                break
            }
            // 2. check if worksheet is present
            // use fuzzy search because of inconsistency in sheet naming
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
            const { item: sheet, score: sheetNameScore } = searchSheet[0]
            if (sheetNameScore >= inconsistentSheetNameScore) {
                errors.push(new InconsistentSheetName(filename, sheet.name, config))
            }
            // 3. check if fields or columns are present
            const data = []
            sheet.eachRow(function (row) {
                row.eachCell(function (cell) {
                    data.push(cell)
                })
            })
            const sheetIndex = Fuse.createIndex(['text'], data)
            const { columns, fields } = config
            if (columns !== null && columns !== undefined) {
                // search the headers on the sheet
                const listQuery = columns.reduce(function (query, column) {
                    if (column.header) {
                        query.push({ text: column.header })
                    }
                    return query
                }, [])
                // early break out the switch statement, if we cannot make any search
                if (listQuery.length === 0) break
                // start searching
                const findListHeader = new Fuse(
                    data,
                    {
                        includeScore: true,
                        threshold: missingHeaderThreshold,
                        keys: ['text']
                    },
                    sheetIndex
                )
                const searchListHeader = findListHeader.search({ $or: listQuery })
                if (searchListHeader.length === 0) {
                    columns.map(function (column) {
                        errors.push(new MissingDataHeader(filename, sheet.name, column.key, column.header))
                    })
                } else {
                    // FIX : missing data headers can occur here, too ???
                    // calculate position error
                    const colOffset = columns[0].index
                    const cellOffset = Math.abs(colOffset - searchListHeader[0].item.col)
                    searchListHeader.map(function (curr) {
                        let colIndex = curr.item.col - colOffset - cellOffset
                        if (colIndex < 0) {
                            colIndex = sheet.lastColumn.number - 1 - Math.abs(colIndex) - cellOffset
                        }
                        const column = columns[colIndex % columns.length]
                        const rowError = Math.abs(config.rowOffset - curr.item.row) / sheet.lastRow.number
                        const colError = Math.abs(column.index - curr.item.col) / sheet.lastColumn.number
                        if (curr.score >= inconsistentHeaderScore) errors.push(new InconsistentHeaderName(filename, sheet, column.key, curr.item.text))
                        if (rowError > 0) errors.push(new IncorrectRowIndex(filename, sheet.name, column.key, curr.item.row))
                        if (colError > 0) errors.push(new IncorrectColumnIndex(filename, sheet.name, column.key, curr.item.col))
                    }, [])
                }
            }
            if (fields !== null && fields !== undefined) {
                // search the headers on the sheet
                const objectQuery = fields.reduce(function (query, field) {
                    if (field.header) {
                        query.push({ text: field.header })
                    }
                    return query
                }, [])
                // early break out the switch statement, if we cannot make any search
                if (objectQuery.length === 0) break
                // start searching
                const findObjectHeader = new Fuse(
                    data,
                    {
                        includeScore: true,
                        threshold: missingHeaderThreshold,
                        keys: ['text']
                    },
                    sheetIndex
                )
                const searchObjectHeader = findObjectHeader.search({ $or: objectQuery })
                const objectIndex = Fuse.createIndex(['item.text'], searchObjectHeader)
                fields.map(function (field) {
                    if (!field.header || field.header === '') return field
                    const findField = new Fuse(
                        searchObjectHeader,
                        {
                            includeScore: true,
                            distance: field.header.length,
                            threshold: missingHeaderThreshold,
                            keys: ['item.text']
                        },
                        objectIndex
                    )
                    const searchField = findField.search(field.header)
                    searchField.map(function (curr) {
                        const { item: cell } = curr.item
                        const rowError = Math.abs(field.row - cell.row) / sheet.lastRow.number
                        const colError = Math.abs(field.col - cell.col) / sheet.lastColumn.number
                        curr.rowError = rowError
                        curr.colError = colError
                    })
                    const matches = searchField.filter(function (curr) {
                        if (curr.rowError >= missingHeaderThreshold || curr.colError >= missingHeaderThreshold) return false
                        return true
                    })
                    matches.map(function (curr) {
                        const { item: cell } = curr.item
                        if (curr.score >= inconsistentHeaderScore) errors.push(new InconsistentHeaderName(filename, sheet.name, field.key, cell.text))
                        if (curr.rowError > 0) errors.push(new IncorrectRowIndex(filename, sheet.name, field.key, cell.row))
                        if (curr.colError > 0) errors.push(new IncorrectColumnIndex(filename, sheet.name, field.key, cell.col))
                    })
                    if (matches.length === 0) errors.push(new MissingDataHeader(filename, sheet.name, field.key, field.header))
                })
            }
            // end case: analyze a single config
            break
    }

    return errors
}

/**
 * Parse a *.xlsx file into a data object.
 * @param {String} filename
 * @param {Object} config
 */
function parse(filename, config) {}

/**
 * Validate a *.xlsx files data against a configuration. Returning invalid data points.
 * @param {String} filename
 * @param {Object} config
 */
function validate(filename, config) {}

module.exports = {
    adapt,
    analyze,
    Errors
}
