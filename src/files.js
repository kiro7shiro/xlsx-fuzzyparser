/**
 * Module for handling excel file related functions.
 */

const fs = require('fs')
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')

class FileNotExists extends Error {
    constructor(filepath) {
        super(`File: ${filepath} doesn't exists.`)
        this.filepath = filepath
    }
}

class Errors {
    static FileNotExists = FileNotExists
}

const fileCache = new Map()

async function getWorkbook(filepath) {
    // TODO : implement a expired time
    // TODO : check if file was rewritten during calls and reload it if true
    if (fileCache.has(filepath)) {
        return fileCache.get(filepath)
    }
    const workbook = new ExcelJS.Workbook()
    if (fs.existsSync(filepath)) {
        await workbook.xlsx.readFile(filepath)
    }
    fileCache.set(filepath, workbook)
    return workbook
}

/**
 * Retrieves worksheet data, given certain parameters.
 *
 * @param {Object} worksheet ExcelJS worksheet object
 * @param {Object} [options]
 * @param {Number} [options.startRow] row to start from
 * @param {Number} [options.rowCount] number of rows to retrieve
 * @param {Number} [options.startCol] column to start from
 * @param {Number} [options.colCount] number of columns to retrieve
 * @returns {[ExcelJS.Cell]} array of ExcelJS cell objects
 */
function getWorksheetData(worksheet, { startRow = null, rowCount = null, startCol = null, colCount = null } = {}) {
    // TODO : check for too large sheets that cause a memory overflow when loaded
    if (startRow === null) startRow = 1
    if (rowCount === null) rowCount = worksheet.rowCount
    if (startCol === null) startCol = 1
    if (colCount === null) colCount = worksheet.columnCount
    const endCol = startCol + colCount
    let data = []
    const rows = worksheet.getRows(startRow, rowCount)
    if (!rows || rows.length === 0) {
        return data
    }
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex]
        for (let colIndex = startCol; colIndex < endCol; colIndex++) {
            const cell = row.getCell(colIndex)
            if (cell.type === ExcelJS.ValueType.Merge) {
                // TODO : implement two strategies: unmerge and keep values in master cell or unmerge and split values into the resulting cells
                worksheet.unMergeCells(cell.master.address)
            }
            if (cell.type === ExcelJS.ValueType.Null) continue
            data.push(cell)
        }
    }
    return data
}

function createConfig(workbook) {}

/**
 * Loads an index of the contents of an Excel file from a JSON file.
 *
 * @param {string} filename - The path of the Excel file to read from. If the filename ends with '-index.json', it is assumed to be the index file itself.
 * @param {Object} [options]
 * @param {string[]} [options.sheetKeys] - Keys to be used for indexing sheet data.
 * @param {string[]} [options.cellKeys] - Keys to be used for indexing cell data.
 * @returns {Promise<Object>} - A promise that resolves to the index object created from the Excel file.
 * @throws Will throw an error if reading the Excel file or writing the JSON file fails.
 */
async function loadIndex(filename, { sheetKeys = ['name'], cellKeys = ['text'] } = {}) {
    let indexName = null
    if (filename.endsWith('-index.json')) {
        indexName = filename
        filename = filename.replace('-index.json', '.xlsx')
    } else {
        indexName = filename.replace(/\.[^.]+$/, '-index.json')
    }
    let index = {}
    if (fs.existsSync(indexName)) {
        const srcStat = fs.statSync(filename)
        const indexStat = fs.statSync(indexName)
        if (srcStat.mtimeMs > indexStat.mtimeMs) {
            await saveIndex(filename, { sheetKeys, cellKeys })
        }
        const json = fs.readFileSync(indexName, 'utf-8')
        index = JSON.parse(json)
        for (const key in index) {
            const item = index[key]
            index[key] = Fuse.parseIndex(item)
        }
        return index
    } else {
        index = await saveIndex(filename, { cellKeys })
    }
    return index
}

/**
 * Saves an index of the contents of an Excel file as a JSON file.
 *
 * @param {string} filename - The path of the Excel file to read from. If the filename ends with '-index.json', it is assumed to be the index file itself.
 * @param {Object} [options]
 * @param {string[]} [options.sheetKeys] - Keys to be used for indexing sheet data.
 * @param {string[]} [options.cellKeys] - Keys to be used for indexing cell data.
 * @returns {Promise<Object>} - A promise that resolves to the index object created from the Excel file.
 * @throws Will throw an error if reading the Excel file or writing the JSON file fails.
 */
async function saveIndex(filename, { sheetKeys = ['name'], cellKeys = ['text'] } = {}) {
    let index = {}
    let indexName = null
    if (filename.endsWith('-index.json')) {
        indexName = filename
        filename = filename.replace('-index.json', '.xlsx')
    } else {
        indexName = filename.replace(/\.[^.]+$/, '-index.json')
    }
    try {
        const workbook = await getWorkbook(filename)
        index.sheetNamesIndex = new Fuse(workbook.worksheets, { keys: sheetKeys }).getIndex()
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

module.exports = {
    Errors,
    getWorkbook,
    getWorksheetData,
    loadIndex,
    saveIndex
}
