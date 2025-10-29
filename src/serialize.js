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
            worksheet: 'report',
            row: 1,
            columns: [
                { index: 1, key: 'filepath' },
                { index: 2, key: 'filename' },
                { index: 3, key: 'lastModified' }
            ]
        }
    } = {},
    { mode = 'overwrite' } = {}
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
    // validate config and use results as flags
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    if (!isConfig && !isMultiConfig) {
        // TODO : throw error for invalid configs
        return false
    }
    if (isMultiConfig) {
        // write a multi config into a file
        for (const key of config) {
            const subConfig = config[key]
            await serialize(filepath, data, subConfig)
        }
    } else {
        // add or select sheet
        let worksheet = null
        for (let sCnt = 0; sCnt < workbook.worksheets.length; sCnt++) {
            const sheet = workbook.worksheets[sCnt]
            if (sheet.name === config.worksheet) {
                worksheet = sheet
                break
            }
        }
        if (worksheet === null) {
            worksheet = workbook.addWorksheet(config.worksheet)
        }
        // write object or list
        if (config.type === 'object') {
            // TODO : write object data into file
        } else {
            if (mode === 'overwrite') {
                // write list header
                // TODO : check config for descriptor headers
                const headerRow = worksheet.getRow(config.row - 1)
                headerRow.values = Object.keys(data[0])
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    const row = worksheet.getRow(config.row + dIndex)
                    row.values = Object.values(data[dIndex])
                }
            } else {
                // append list data
                // TODO : get endRow
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    worksheet.addRow(Object.values(data[dIndex]))
                }
            }
        }
        // save file
        await workbook.xlsx.writeFile(filepath)
        return true
    }
}

module.exports = { serialize }
