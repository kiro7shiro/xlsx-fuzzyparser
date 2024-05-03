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
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: '${worksheet}' data header for: '${key}' is present but named inconsistent.`)
        this.name = 'InconsistentHeaderName'
        this.key = key
        this.actual = actual
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
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: '${worksheet}' column index: '${key}' seems to be: ${actual}.`)
        this.name = 'IncorrectColumnIndex'
        this.key = key
        this.actual = actual
    }
}

class IncorrectRowIndex extends ValidationError {
    constructor(filename, worksheet, key, actual) {
        super(filename, worksheet, `Worksheet: '${worksheet}' row index: '${key}' seems to be: ${actual}.`)
        this.name = 'IncorrectRowIndex'
        this.key = key
        this.actual = actual
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

/**
 * Analyze a *.xlsx file against a configuration. Returning the differences.
 * @param {String} filename
 * @param {Object} config
 * @returns {[ValidationError]} errors
 */
async function analyze(filename, config, { sheetMissingThreshold = 0, inconsistentSheetNameScore = 0.001 } = {}) {
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
                errors.push(...(await analyze(filename, subConfig)))
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
                // early break out the switch statement, because we cannot access the file
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
                threshold: sheetMissingThreshold
            })
            const searchSheet = fuse.search(config.worksheet)
            if (!searchSheet.length) {
                errors.push(new SheetMissing(filename, config.worksheet))
                // early break out the switch statement, because the sheet can't be accessed
                break
            }
            const { item: sheetName, score } = searchSheet[0]
            if (score >= inconsistentSheetNameScore) {
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
            if (columns !== null && columns !== undefined) {
                // testing columns
                // tries to find the data header row of a list
                // by joining the data into an array of strings and then
                // makes a fuzzy search for the headers in the new array
                // if the headers could be found it will test if the column
                // headers are present and in the expected position
                // saving any found differences as errors
                // lastly it will try to find data headers that are not present
                // in the config
                const rowOffset = config.rowOffset > -1 ? config.rowOffset : 0
                const columnHeaders = config.columnHeaders ? config.columnHeaders : []
                const columnKeys = columns.reduce(function (keys, column) {
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
                    const findHeaderRow = new Fuse(expandedData, { includeScore: true })
                    const [searchHeaderRow] = findHeaderRow.search(joinedHeads)
                    if (searchHeaderRow == null || searchHeaderRow === undefined) {
                        errors.push(new ColumnHeadersMissing(filename, sheetName))
                    } else {
                        const { item: found, refIndex } = searchHeaderRow
                        if (rowOffset - 1 !== refIndex) {
                            errors.push(new IncorrectRowOffset(filename, sheetName, 'columnHeaders', refIndex + 1))
                        }
                        // compare column indices
                        // 1. split found back into cells
                        const cells = found.split('\n').reduce(function (accu, curr) {
                            accu.push(curr.split(','))
                            return accu
                        }, [])
                        // 2. reduce headers and cells into one string for fuzzy search
                        //    rows are separated by newlines
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
                            // TODO : swapped headers
                            //		  1. simple swap, headers are moved one column
                            //		  2. complex swap, headers are moved more than one column
                            const colHead = columnHeads[cCnt]
                            findHeader.options.distance = colHead.length
                            const [pose] = findHeader.search(colHead)
                            if (pose !== null && pose !== undefined) {
                                const { refIndex } = pose
                                const colOffset = config.columns[cCnt].index - 1
                                if (colOffset !== refIndex) {
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
                                if (pose.score >= 0.001) {
                                    errors.push(new InconsistentHeaderName(filename, sheetName, config.columns[cCnt].key, pose.item))
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
                            if (!pose || pose.score > 0) {
                                errors.push(new DataHeaderNotInConfig(filename, sheetName, cell, cCnt))
                            }
                        }
                    }
                }
            }
            if (fields !== null && fields !== undefined) {
                // testing fields
                // tries to find the data header of a field
                // by first testing common patterns of header positions
                // around the indicated data position
                // if the header can't be found the whole sheet is searched
                // for the data header
                for (let fCnt = 0; fCnt < fields.length; fCnt++) {
                    const field = fields[fCnt]
                    const { header } = field
                    if (header !== null && header !== undefined) {
                        // check expected header patterns to verify position
                        const top = data[field.row - 2][field.col - 1]
                        const left = data[field.row - 1][field.col - 2]
                        const right = data[field.row - 1][field.col]
                        const bottom = data[field.row][field.col - 1]
                        const window = [left, top, right, bottom].map((c) => (typeof c === 'string' ? c : ''))
                        const findHeader = new Fuse(window, {
                            includeScore: true,
                            location: 0,
                            threshold: 0.3,
                            distance: header.length
                        })
                        const [searchHeader] = findHeader.search(header)
                        if (searchHeader === null || searchHeader === undefined) {
                            // search for the data header elsewhere on the sheet
                            const rows = data.reduce(function (accu, curr, index) {
                                curr.reduce(function (a, c, i) {
                                    a.push({
                                        row: index,
                                        col: i,
                                        value: typeof c === 'string' ? c : ''
                                    })
                                    return a
                                }, accu)
                                return accu
                            }, [])
                            const findPosition = new Fuse(rows, {
                                includeScore: true,
                                location: 0,
                                threshold: 0.3,
                                keys: ['value']
                            })
                            const [pose] = findPosition.search(header)
                            if (pose === null || pose === undefined) {
                                errors.push(new MissingDataHeader(filename, sheetName, field.key, header))
                            } else {
                                const { item: cell } = pose
                                if (cell.row != field.row - 1) errors.push(new IncorrectRowIndex(filename, sheetName, field.key, cell.row + 1))
                                if (cell.col != field.col - 1) errors.push(new IncorrectColumnIndex(filename, sheetName, field.key, cell.col + 1))
                            }
                        } else if (searchHeader.score >= 0.001) {
                            errors.push(new InconsistentHeaderName(filename, sheetName, field.key, searchHeader.item))
                        }
                    }
                }
            }
            // end case: validate a single config
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

// NOTE : analyze() => validate() => adapt() => parse()
//        calling parse() first will apply the above chain

// TODO :
// [ ]  : validateData
// [ ]  : make a parse() function
// [ ]  : make a cache for analyze()
// [ ]  : make default parameters for analyze()
// [ ]  : add optional parameters to analyze() for adapting the search behavior

// [x]  : analyzeListData
// [x]  : analyzeFieldData
// [x]  : rename validate() to analyze()
