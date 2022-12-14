const fs = require('fs').promises
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

const { validateColumns, validateFields, validateConfig, validateMultiConfig } = require('./xlsx-schema.js')

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
        super(filename, worksheet, `Worksheet: ${worksheet} is missing.`)
        this.name = 'SheetMissing'
    }
}

class InconsistentSheetName extends ValidationError {
    constructor(filename, worksheet, config) {
        super(filename, config.worksheet, `Worksheet: ${config.worksheet} is present but named inconsistent.`)
        this.name = 'InconsistentSheetName'
        this.key = 'worksheet'
        this.actual = worksheet
    }
}

class ColumnHeadersNotFound extends ValidationError {
    constructor(filename, worksheet) {
        super(filename, worksheet, `Worksheet: ${worksheet} column headers not found.`)
        this.name = 'ColumnHeadersNotFound'
        this.key = 'columnHeaders'
    }
}

class IncorrectRowOffset extends ValidationError {
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: ${worksheet} rowOffset seems to be: ${actual}.`)
        this.name = 'IncorrectRowOffset'
        this.key = key
        this.actual = actual
    }
}

class IncorrectColumnIndex extends ValidationError {
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: ${worksheet} column index: ${key} seems to be: ${actual}.`)
        this.name = 'IncorrectColumnIndex'
        this.key = key
        this.actual = actual
    }
}

class MissingDataHeader extends ValidationError {
    constructor(filename, worksheet, key, header) {
        super(filename, worksheet, `Worksheet: ${worksheet} data header for: ${key} is missing.`)
        this.name = 'MissingDataHeader'
        this.key = key
        this.header = header
    }
}

class DataHeaderNotInConfig extends ValidationError {
    constructor(filename, worksheet, header, index) {
        super(filename, worksheet, `Worksheet: ${worksheet} data header: ${header} not in config.`)
        this.name = 'DataHeaderNotInConfig'
        this.header = header
        this.index = index
    }
}

class InvalidData extends ValidationError {
    constructor(filename, worksheet, key) {
        super(filename, worksheet, `Worksheet: ${worksheet} key: ${key} contains invalid data.`)
        this.name = 'InvalidData'
        this.key = key
    }
}

class Errors {
    static ValidationError = ValidationError
    static FileNotExists = FileNotExists
    static ConfigInvalid = ConfigInvalid
    static SheetMissing = SheetMissing
    static InconsistentSheetName = InconsistentSheetName
    static ColumnHeadersNotFound = ColumnHeadersNotFound
    static IncorrectRowOffset = IncorrectRowOffset
    static IncorrectColumnIndex = IncorrectColumnIndex
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
                    return error.name === 'DataHeaderNotInConfig'
                })
            } else {
            }
            // TODO : strategy for adapting empty values? set to zero or null string
            break
    }

    return adaption
}

/**
 * Validate a *.xlsx file with a configuration. Returning the differences.
 * @param {String} filename
 * @param {Object} config
 * @returns {[ValidationError]} errors
 */
async function validate(filename, config) {
    try {
        await fs.access(filename, fs.constants.W_OK | fs.constants.R_OK)
    } catch (error) {
        throw new FileNotExists(filename)
    }
    // validate config and use the results as flags
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
            // validate a multi config
            for (const key in config) {
                const subConfig = config[key]
                errors.push(...(await validate(filename, subConfig)))
            }
            break

        case !isColumns && !isFields:
            // validate a single config
            // 1. read file
            const workbook = new ExcelJS.Workbook()
            try {
                await workbook.xlsx.readFile(filename)
            } catch (error) {
                errors.push(error)
                // early break out because we cannot access the file
                break
            }
            // 2. check if worksheet is present
            const sheetNames = workbook.worksheets.reduce(function (accu, curr) {
                accu.push(curr.name)
                return accu
            }, [])
            // use fuzzy search because of inconsistency in sheet naming
            const fuse = new Fuse(sheetNames, {
                includeScore: true,
                location: 0,
                threshold: 0.3,
                distance: config.worksheet.length
            })
            const sheets = fuse.search(config.worksheet)
            if (!sheets.length) {
                errors.push(new SheetMissing(filename, config.worksheet))
                // early break out the switch statement, because we cannot access the sheet
                break
            }
            const { item: sheetName, score } = sheets[0]
            if (score >= 0.001) {
                errors.push(new InconsistentSheetName(filename, sheetName, config))
            }
            // 3. check if fields or columns are present
            const sheet = workbook.getWorksheet(sheetName)
            const data = sheet
                .getRows(1, 1 + sheet.lastRow.number)
                .reduce(function (prev, curr) {
                    prev.push(curr.values)
                    return prev
                }, [])
                .map(function (row) {
                    // remove undefined from first position
                    if (row[0] === undefined) row.shift()
                    // trim off whitespace
                    return row.map((cell) => {
                        if (cell && cell.trim) {
                            return cell.trim()
                        } else {
                            return cell
                        }
                    })
                })
            const { columns, fields } = config
            if (columns) {
                // testing columns first tries to find the data header row
                // by joining the data into an array of strings and then
                // makes a fuzzy search for the headers in the new array
                // if the headers could be found it will test if the column
                // headers are present and in the expected position
                // saving any found differences as errors
                // lastly it will try to find data headers that are not present
                // in the config
                const rowOffset = config.rowOffset > -1 ? config.rowOffset : 0
                const columnHeaders = config.columnHeaders ? config.columnHeaders : []
                const columnKeys = config.columns.reduce(function (keys, column) {
                    keys.push(column.key)
                    return keys
                }, [])
                if (columnHeaders.length) {
                    // join headers and data into an array of strings for fuzzy search
                    const joinedHeads = columnHeaders
                        .reduce(function (joined, heads) {
                            joined.push(heads.join(','))
                            return joined
                        }, [])
                        .join('\n')
                    const joinedRows = data.reduce(function (joined, row) {
                        joined.push(row.join(','))
                        return joined
                    }, [])
                    // put the rows in pairs of headers.length separated by newline
                    const expandedData = []
                    for (let pCnt = 0; pCnt < joinedRows.length; pCnt++) {
                        expandedData.push(joinedRows.slice(pCnt, pCnt + columnHeaders.length).join('\n'))
                    }
                    // search the header row
                    const findHeaderRow = new Fuse(expandedData, {
                        includeScore: true,
                        location: 0,
                        threshold: 0.7,
                        distance: joinedHeads.length
                    })
                    const [search] = findHeaderRow.search(joinedHeads)
                    if (search.score >= 0.3) {
                        errors.push(new ColumnHeadersNotFound(filename, sheetName))
                    } else {
                        const { item: found, refIndex } = search
                        if (rowOffset - 1 !== refIndex) {
                            errors.push(new IncorrectRowOffset(filename, sheetName, 'columnHeaders', refIndex + 1))
                        }
                        // compare column indices
                        // 1. split found back into cells
                        const cells = found.split('\n').reduce(function (accu, curr) {
                            accu.push(curr.split(','))
                            return accu
                        }, [])
                        // 2. reduce headers and cells into one row for fuzzy search
                        const reduceToOneRow = function (accu, curr, index) {
                            if (accu.length < curr.length) {
                                const loop = curr.length - accu.length
                                for (let i = 0; i < loop; i++) {
                                    accu.push('')
                                }
                            }
                            curr.map(function (value, idx) {
                                accu[idx] += index === columnHeaders.length - 1 ? value : value + '\n'
                            })
                            return accu
                        }
                        const columnHeads = columnHeaders.reduce(reduceToOneRow, [])
                        const columnCells = cells.reduce(reduceToOneRow, [])
                        // 3. fuzzy search each column header
                        const findHeader = new Fuse(columnCells, {
                            includeScore: true,
                            location: 0,
                            threshold: 0.3,
                            distance: 0
                        })
                        for (let cCnt = 0; cCnt < columnHeads.length; cCnt++) {
                            // compare column indices and save differences
                            const colHead = columnHeads[cCnt]
                            findHeader.options.distance = colHead.length
                            const [pose] = findHeader.search(colHead)
                            if (pose) {
                                const { refIndex } = pose
                                const colOffset = config.columns[cCnt].index - 1
                                if (colOffset !== refIndex) {
                                    // TODO : swapped headers
                                    // if fuzzy search fails. we try to find the header the hard way
                                    // the hard way goes like this:
                                    // first make a check string from the header and it's neighbors
                                    // than go from left to right over the cell data and make a
                                    // "look window" from the current position and it's neighbors
                                    // if booth match we found the correct position
                                    const headIndex = columnHeads.indexOf(colHead)
                                    const check = columnHeads
                                        .filter(function (cell, index) {
                                            if (index === headIndex - 1 && headIndex) return true
                                            if (index === headIndex) return true
                                            if (index === headIndex + 1 && headIndex < columnHeads.length) return true
                                            return false
                                        })
                                        .join('|')
                                    let window = []
                                    let windowCnt = refIndex
                                    do {
                                        window = columnCells
                                            .filter(function (cell, index) {
                                                if (index === windowCnt - 1 && cCnt) return true
                                                if (index === windowCnt) return true
                                                if (index === windowCnt + 1 && cCnt < columnHeads.length - 1) return true
                                                return false
                                            })
                                            .join('|')
                                        windowCnt++
                                    } while (check !== window && windowCnt + 1 <= columnCells.length - 1)
                                    // if the hard way don't work, too. save the expected position instead
                                    if (check !== window) windowCnt = colOffset + 1
                                    errors.push(new IncorrectColumnIndex(filename, sheetName, config.columns[cCnt].key, windowCnt))
                                }
                            } else {
                                errors.push(new MissingDataHeader(filename, sheetName, columnKeys[cCnt], colHead))
                            }
                        }
                        // 4. fuzzy search new data headers
                        const findData = new Fuse(columnHeads, {
                            includeScore: true,
                            location: 0,
                            threshold: 0.3,
                            distance: 0
                        })
                        for (let cCnt = 0; cCnt < columnCells.length; cCnt++) {
                            const cell = columnCells[cCnt]
                            findData.options.distance = cell.length
                            const [pose] = findData.search(cell)
                            if (!pose && cell !== '') {
                                errors.push(new DataHeaderNotInConfig(filename, sheetName, cell, cCnt))
                            }
                        }
                    }
                }
                // TODO : validate list data
            }
            if (fields) {
                // testing fields
                for (let fCnt = 0; fCnt < fields.length; fCnt++) {
                    const field = fields[fCnt]
                    const row = data[field.row - 1]
                    const cell = row[field.col - 1]
                    // TODO : check mappers
                    if (!cell) {
                        errors.push(new InvalidData(filename, sheetName, field.key))
                    }
                }
                // TODO : validate object data
            }
            break
    }

    return errors
}

module.exports = {
    adapt,
    validate,
    Errors
}

// TODO :
// validateData
// validateListData
// validateFieldData
