const fs = require('fs').promises
const path = require('path')
const ExcelJS = require('exceljs')
const Fuse = require('fuse.js')
const { getWorksheetData } = require('../src/files.js')

async function scoring() {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const workbook = new ExcelJS.Workbook()
    try {
        // 1. read the file
        await workbook.xlsx.readFile(testFile)
        // 2. get the sheet
        const testSheet = workbook.getWorksheet('TestSheet')
        const data = getWorksheetData(testSheet)
        const sheetEngine = new Fuse(data, { includeScore: true, keys: ['text'], threshold: 0.1 })
        const searchString = 'aaaaaaaaaa'
        const searchResults = sheetEngine.search(searchString)
        const output = testSheet.getRows(2, searchResults.length)
        for (let rowIndex = 0; rowIndex < output.length; rowIndex++) {
            const row = output[rowIndex]
            row.getCell(4).value = searchResults[rowIndex].score
        }
        await workbook.xlsx.writeFile(testFile)
    } catch (error) {
        throw error
    }
}

async function logical() {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const workbook = new ExcelJS.Workbook()
    try {
        // 1. read the file
        await workbook.xlsx.readFile(testFile)
        // 2. get the sheet
        const testSheet = workbook.getWorksheet('TestSheet')
        const data = getWorksheetData(testSheet, { startRow: 29, rowCount: 14, startCol: 2, colCount: 2 })
        console.table(data)
        const sheetEngine = new Fuse(data, { includeScore: true, useExtendedSearch: true, keys: ['text'] })
        const query = { $or: [{ text: 'aa' }, { text: 'bb' }] }
        const searchResults = sheetEngine.search(query).map(function (match) {
            match.row = match.item.row
            match.col = match.item.col
            match.text = match.item.text
            return match
        })
        console.table(searchResults, ['score', 'row', 'col', 'text'])
    } catch (error) {
        throw error
    }
}

//scoring()
//logical()
