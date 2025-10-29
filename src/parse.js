/**
 * Module for parsing data from an excel file.
 */

const fs = require('fs')
const path = require('path')
const { validateConfig, validateMultiConfig } = require('./config.js')
const { getWorkbook, getWorksheetData } = require('./files.js')

class ParsingError extends Error {
    constructor(filepath, message) {
        super(message)
        this.name = 'ParsingError'
        this.filepath = filepath
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
    // check config
    if (config === null) throw new ParsingError(filepath, `Can't parse: ${path.basename(filepath)}. No config given.`)
    if (typeof config === 'string') {
        const ext = path.extname(config)
        if (ext === '.json') {
            const configContent = fs.readFileSync(config, 'utf8')
            config = JSON.parse(configContent)
        } else if (ext === '.js') {
            config = require(config)
        }
    }
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    if (!isConfig && !isMultiConfig) {
        // TODO : throw error for invalid config
        // TODO : import errors from config.js
        return false
    }
    if (isMultiConfig) {
        // parse a multi config
        for (const key of config) {
            const subConfig = fileConfig[key]
            await parse(filepath, subConfig)
        }
    } else {
        const workbook = await getWorkbook(filepath)
        const worksheet = workbook.getWorksheet(config.worksheet)
        let result = []
        if (config.type === 'object') {
            const obj = {}
            for (let fCnt = 0; fCnt < config.fields.length; fCnt++) {
                const field = config.fields[fCnt]
                const value = worksheet.getRow(field.row).values[field.col]
                obj[field.key] = value
            }
            if (config.parsers) config.parsers.map(parser => parser(obj))
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
                if (config.parsers) config.parsers.map(parser => parser(obj))
                return obj
            })
        }
        return result
    }
}

module.exports = { parse, Errors }
