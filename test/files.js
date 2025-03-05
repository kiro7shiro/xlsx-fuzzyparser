const assert = require('assert')
const path = require('path')
const ExcelJS = require('exceljs')
const { loadIndex, getWorksheetData } = require('../src/files.js')

describe('files', function () {
    it('loadIndex', async function () {
        const testFile = path.resolve(__dirname, './data/test-file.xlsx')
        const index = await loadIndex(testFile)
        console.log(index)
    })
    /* it('getWorksheetData', async function () {
        const testFile = path.resolve(__dirname, './data/test-file.xlsx')
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(testFile)   
        const testSheet = workbook.getWorksheet('TestSheet')
        console.log(testSheet.workbook)
    }) */
})

async function testValues() {
    const testFile = path.resolve(__dirname, './data/real/test-newline-file.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(testFile)
    const testSheet = workbook.getWorksheet('Hallen')
    const data = getWorksheetData(testSheet).filter(function (cell) {
        return cell.row > 11 && cell.row < 14
    }).map(function (cell) {
        cell.testText = cell.text
        cell.testValue = cell.value
        cell.testStyle = cell.style
        cell.testType = cell.type
        return cell
    })
    
    console.table(data)
    console.log(ExcelJS.ValueType)
    console.log(data[4])
    console.log(data[5])
}

//testValues()