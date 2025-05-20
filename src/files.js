/**
 * Module for handling file related functions
 * retrieving file data
 * save an index.json file nearby the opened files
 * load file index if a json file is present nearby
 */

const fs = require('fs')
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

/**
 * Retrieves worksheet data, given certain parameters.
 * @param {Object} worksheet exceljs worksheet object
 * @param {Object} [options]
 * @param {Number} [options.startRow=1] row to start from
 * @param {Number} [options.rowCount=worksheet.rowCount] number of rows to retrieve
 * @param {Number} [options.startCol=1] column to start from
 * @param {Number} [options.colCount=worksheet.columnCount] number of columns to retrieve
 * @returns {Array} array of exceljs cell objects
 */
function getWorksheetData(worksheet, { startRow = null, rowCount = null, startCol = null, colCount = null } = {}) {
    // FIXME : empty merged cells produce an error when trying to create a fuse index, make a test 
    if (startRow === null) startRow = 1
    if (rowCount === null) rowCount = worksheet.rowCount
    if (startCol === null) startCol = 1
    if (colCount === null) colCount = worksheet.columnCount
    const endCol = startCol + colCount
    let data = []
    const rows = worksheet.getRows(startRow, rowCount)
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex]
        for (let colIndex = startCol; colIndex < endCol; colIndex++) {
            const cell = row.getCell(colIndex)
            if (cell.type === ExcelJS.ValueType.Null) continue
            if (cell.type === ExcelJS.ValueType.Merge) {
                worksheet.unMergeCells(cell.address)
            }
            data.push(cell)    
        }
    }
    return data
}

function createConfig(workbook) {}

async function saveIndex(filename, { cellKeys = ['text'] } = {}) {
    let index = {}
    //const indexName = `${filename}-index.json`
    let indexName = null
    if (filename.endsWith('-index.json')) {
        indexName = filename
    } else {
        indexName = filename.replace(/\.[^.]+$/, '-index.json')
    }
    const workbook = new ExcelJS.Workbook()
    try {
        await workbook.xlsx.readFile(filename)
        index.sheetNamesIndex = new Fuse(workbook.worksheets, { keys: ['name'] }).getIndex()
        for (let sheetIndex = 0; sheetIndex < workbook.worksheets.length; sheetIndex++) {
            const sheet = workbook.worksheets[sheetIndex]
            const data = getWorksheetData(sheet)
            index[sheet.name] = Fuse.createIndex(cellKeys, data)
        }
        const json = JSON.stringify(index, null, 4)
        fs.writeFileSync(indexName, json, 'utf-8')
        return index
    } catch (error) {
        throw error
    }
}
async function loadIndex(filename, { cellKeys = ['text'] } = {}) {
    //const indexName = `${filename}-index.json`
    let indexName = null
    if (filename.endsWith('-index.json')) {
        indexName = filename
    } else {
        indexName = filename.replace(/\.[^.]+$/, '-index.json')
    }
    let index = {}
    if (fs.existsSync(indexName)) {
        const srcStat = fs.statSync(filename)
        const indexStat = fs.statSync(indexName)
        if (srcStat.mtimeMs > indexStat.mtimeMs) {
            await saveIndex(filename, { cellKeys })
        }
        const json = fs.readFileSync(indexName, 'utf-8')
        index = JSON.parse(json)
        for (const key in index) {
            const item = index[key]
            index[key] = Fuse.parseIndex(item)
        }
        return index
    }
    index = await saveIndex(filename, { cellKeys })
    return index
}

module.exports = {
    getWorksheetData,
    loadIndex
}
