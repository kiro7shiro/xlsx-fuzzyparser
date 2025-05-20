const assert = require('assert')
const path = require('path')
const ExcelJS = require('exceljs')
const { loadIndex, getWorksheetData } = require('../src/files.js')

describe('files', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    describe('indexing', function () {
        it('loadIndex', async function () {
            // Initial load of the index
            const index = await loadIndex(testFile)
            assert.ok(index, 'Initial index should be loaded')
            assert.ok(Object.hasOwn(index, 'Indexing'), 'Indexing should be loaded')
            // Simulate a file change by modifying the file
            const oldChange = index.Indexing.records[1]['$']['0']['v']
            //console.log({ index: oldChange })
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Indexing')
            let change = testSheet.getRow(1).getCell(2).value
            change = change === 0 ? 1 : 0
            testSheet.getRow(1).getCell(2).value = change
            await workbook.xlsx.writeFile(testFile)
            const index2 = await loadIndex(testFile)
            const newChange = index2.Indexing.records[1]['$']['0']['v']
            //console.log({ index2: newChange })
            assert.ok(oldChange !== newChange)
        })
        it('saveIndex')
    })
    describe('getWorksheetData', function () {
        it('load cells', async function () {
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Indexing')
        })
        it('load selected cells')
        it('load and unmerge cells')
    })
})

async function testValues() {
    const testFile = path.resolve(__dirname, './data/real/test-newline-file.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(testFile)
    const testSheet = workbook.getWorksheet('Hallen')
    const data = getWorksheetData(testSheet)
        .filter(function (cell) {
            return cell.row > 11 && cell.row < 14
        })
        .map(function (cell) {
            cell.testText = cell.text
            cell.testValue = cell.value
            cell.testStyle = cell.style
            cell.testType = cell.type
            return cell
        })
    const first = data[0]
    console.table(data)
    console.log(ExcelJS.ValueType)
    console.log(Object.keys(workbook.worksheets[0]))
    console.log(workbook.worksheets[0].properties)
    //console.log(first)
    console.log(first.value, first.type)
    for (const key in ExcelJS.ValueType) {
        const valType = ExcelJS.ValueType[key]
        console.log(key, first.type === valType)
    }
    //console.log(data[4])
    //console.log(data[5])
}

//testValues()
