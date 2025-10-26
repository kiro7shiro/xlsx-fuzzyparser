/**
 * Module for parsing data from an excel file.
 */

const { validateConfig, validateMultiConfig } = require('./config.js')
const { getWorkbook, getWorksheetData } = require('./files.js')

class ParsingError extends Error {
    constructor(filename, message) {
        super(message)
        this.name = 'ParsingError'
        this.filename = filename
    }
}

class Errors {
    static ParsingError = ParsingError
}

/**
 * Parse a *.xlsx file into a data object.
 * @param {String} filepath
 * @param {Object} config
 */
async function parse(filepath, config = null) {
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    if (!isConfig && !isMultiConfig) {
        // TODO : throw error for invalid config
        return false
    }
    if (isMultiConfig) {
        // parse a multi config
        for (const key of config) {
            const subConfig = fileConfig[key]
            await parse2(filepath, subConfig)
        }
    } else {
        const workbook = await getWorkbook(filepath)
        const worksheet = workbook.getWorksheet(config.worksheet)
        let result = []
        if (config.type === 'object') {
            const obj = {}
            for (let fCnt = 0; fCnt < config.fields.length; fCnt++) {
                const field = config.fields[fCnt]
                obj[field.key] = worksheet.getRow(field.row).values[field.col]
            }
            result.push(obj)
        } else {
            const startRow = config === null ? 1 : config.row
            const rows = worksheet.getRows(startRow, worksheet.rowCount)
            result = rows.map(function (row) {
                const values = row.values
                const obj = {}
                for (let cCnt = 0; cCnt < config.columns.length; cCnt++) {
                    const column = config.columns[cCnt]
                    obj[column.key] = values[column.index]
                }
                return obj
            })
        }
        return result
    }
}

module.exports = { parse, Errors }
