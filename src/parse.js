/**
 * Module for parsing data from an excel file.
 */

const fs = require('fs')
const path = require('path')
const { validateConfig, validateMultiConfig } = require('./config.js')
const { getWorkbook } = require('./files.js')

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
        if(!isConfig) {
            console.log(validateConfig.errors)
            console.log(config)
        }
        return false
    }
    if (isMultiConfig) {
        // parse a multi config
        const result = {}
        for (const key in config) {
            const subConfig = config[key]
            result[key] = await parse(filepath, subConfig)
        }
        return result
    } else {
        // TODO : make an error check when the sheet is not present in the file
        // this is part of the analyzing step
        const workbook = await getWorkbook(filepath)
        const worksheet = workbook.getWorksheet(config.sheetName)
        let parsed = []
        if (config.type === 'object') {
            const obj = {}
            for (let fCnt = 0; fCnt < config.fields.length; fCnt++) {
                const field = config.fields[fCnt]
                const cell = worksheet.getRow(field.row).getCell(field.column)
                obj[field.key] = cell.text
                if (Object.hasOwn(field, 'parser')) {
                    obj[field.key] = field.parser(cell)
                }
            }
            parsed.push(obj)
        } else {
            const startRow = config === null ? 1 : config.row
            // TODO : calc an endRow variable
            const rows = worksheet.getRows(startRow, worksheet.rowCount).filter((r) => !r.hidden && r.hasValues)
            parsed = rows.map(function (row) {
                const obj = {}
                for (let cCnt = 0; cCnt < config.columns.length; cCnt++) {
                    const column = config.columns[cCnt]
                    const cell = row.getCell(column.index)
                    obj[column.key] = cell.text
                    if (Object.hasOwn(column, 'parser')) {
                        obj[column.key] = column.parser(cell)
                    }
                }
                return obj
            })
        }
        return parsed
    }
}

module.exports = { parse, Errors }
