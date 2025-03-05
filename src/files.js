/**
 * Module for handling file related functions
 * retrieving file data
 * save an index.json file nearby the opened files
 * load file index if a json file is present nearby
 */

const fs = require('fs')
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

async function getWorkbookData(workbook) {}

function getWorksheetData(worksheet, { startRow = null, rowCount = null, startCol = null, colCount = null } = {}) {
    // FIXME : empty merged cells produce an error when trying to create a fuse index
    // FIXME : make the error check in the loop more robust if possible
    if (startRow === null) startRow = 1
    if (rowCount === null) rowCount = worksheet.rowCount
    if (startCol === null) startCol = 1
    if (colCount === null) colCount = worksheet.columnCount
    const endCol = startCol + colCount
    //console.log({ startRow, rowCount, startCol, colCount })
    let data = []
    const rows = worksheet.getRows(startRow, rowCount)
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex]
        for (let colIndex = startCol; colIndex < endCol; colIndex++) {
            const cell = row.getCell(colIndex)
            try {
                // the next statement is the actual error check
                // if we can't access the text property of a cell
                // it will be filtered out of our data
                const check = cell.text
                data.push(cell)
            } catch (error) {}
        }
    }
    return data
}

function createConfig(workbook) {}
async function saveIndex(filename, { cellKeys = [] } = {}) {
    let index = {}
    const indexName = `${filename}-index.json`
    const workbook = new ExcelJS.Workbook()
    try {
        await workbook.xlsx.readFile(filename)
        if (cellKeys.length === 0) cellKeys.push('text')
        const sheetNames = workbook.worksheets.reduce(function (names, sheet) {
            names.push(sheet.name)
            return names
        }, [])
        index.sheetNamesIndex = new Fuse(sheetNames).getIndex()
        for (let sheetIndex = 0; sheetIndex < workbook.worksheets.length; sheetIndex++) {
            const sheet = workbook.worksheets[sheetIndex]
            const data = getWorksheetData(sheet)
            index[sheet.name] = Fuse.createIndex(cellKeys, data)
        }
        const json = JSON.stringify(index, null, 4)
        fs.writeFileSync(indexName, json)
        return index
    } catch (error) {
        throw error
    }
}
async function loadIndex(filename, { cellKeys = [] } = {}) {
    const indexName = `${filename}-index.json`
    let index = {}
    if (fs.existsSync(indexName)) {
        // TODO : check if the source file has changed
        index = require(indexName)
        for (const key in index) {
            const item = index[key]
            index[key] = Fuse.parseIndex(item)
        }
        return index
    }
    index = saveIndex(filename, { cellKeys })
    return index
}

module.exports = {
    getWorksheetData,
    loadIndex
}
