/**
 * Module for serializing data into a excel workbook.
 */

const fs = require('fs')
const path = require('path')
const { validateConfig, validateMultiConfig } = require('./config.js')
const { getWorkbook } = require('./files.js')

async function serialize(
    data,
    filepath,
    {
        config = {
            type: 'list',
            sheetName: 'report',
            row: 1,
            columns: [
                { index: 1, key: 'filepath' },
                { index: 2, key: 'filename' },
                { index: 3, key: 'lastModified' }
            ]
        },
        withHeaders = true,
        mode = 'overwrite'
    } = {}
) {
    // check config
    if (typeof config === 'string') {
        const ext = path.extname(config)
        if (ext === '.json') {
            const configContent = fs.readFileSync(config, 'utf8')
            config = JSON.parse(configContent)
        } else if (ext === '.js') {
            config = require(config)
        }
    }
    // open file
    const workbook = await getWorkbook(filepath)
    // TODO : update to serial loop instead of recursion
    // validate config and use results as flags
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    if (!isConfig && !isMultiConfig) {
        // TODO : throw error for invalid configs
        /* console.log(config.sheetName)
        if (!isConfig) console.log(validateConfig.errors) */
        return false
    }
    if (isMultiConfig) {
        // write a multi config into a file    
        for (const key in config) {
            const subConfig = config[key]
            await serialize(data[key], filepath, { config: subConfig })
        }
    } else {
        // select or add a sheet
        let worksheet = null
        for (let sCnt = 0; sCnt < workbook.worksheets.length; sCnt++) {
            const sheet = workbook.worksheets[sCnt]
            if (sheet.name === config.sheetName) {
                worksheet = sheet
                break
            }
        }
        if (worksheet === null) {
            worksheet = workbook.addWorksheet(config.sheetName)
        }
        // write object or list
        if (config.type === 'object') {
            // TODO : write object data into file
        } else {
            if (mode === 'overwrite') {
                // clear sheet
                worksheet.spliceRows(1, worksheet.rowCount)
                // write list header
                let startRow = config.row
                if (withHeaders) {
                    const headers = config.columns.reduce(function (accu, curr) {
                        accu.push(curr.key)
                        return accu
                    }, [])
                    startRow += 1
                    const headerRow = worksheet.getRow(startRow - 1)
                    headerRow.values = headers
                }
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    // format data
                    const dataObj = data[dIndex]
                    const rowValues = []
                    for (let cCnt = 0; cCnt < config.columns.length; cCnt++) {
                        const column = config.columns[cCnt]
                        if (Object.hasOwn(column, 'formatter')) {
                            const cellValue = column.formatter(dataObj)
                            rowValues.push(cellValue)
                        } else {
                            rowValues.push(dataObj[column.key])
                        }
                    }
                    const row = worksheet.getRow(startRow + dIndex)
                    row.values = rowValues
                }
            } else {
                // append list data
                // TODO : get endRow
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    worksheet.addRow(Object.values(data[dIndex]))
                }
            }
        }
    }
    // save file
    await workbook.xlsx.writeFile(filepath)
    return true
}

module.exports = { serialize }
