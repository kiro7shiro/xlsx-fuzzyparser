/**
 * Module for parsing data from an excel file.
 */

const path = require('path')
const { adapt, validate, validateConfig, validateMultiConfig } = require('./analyze.js')

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
            const row = config[key].row
            const column = columns[0].index
            const headers = worksheet.getRow(row).values
            console.log({ row, column })
            console.log(headers)
            const rows = worksheet.getRows(row + 1, columns.length)
            for (const row of rows) {
                console.log(row.values)
                const item = {}
                for (let index = column; index < headers.length; index++) {
                    item[headers[index]] = row.getCell(index).value
                }
                result[key].push(item)
            }
        }
    }
    return result
}

module.exports = { parse, Errors }
