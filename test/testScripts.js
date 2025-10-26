const path = require('path')
const ExcelJS = require('exceljs')
const { getWorksheetData } = require('../src/files.js')

async function testValues() {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(testFile)
    const testSheet = workbook.getWorksheet('TestSheet')
    const data = getWorksheetData(testSheet)
    const first = data[0]
    //console.table(data)
    console.log(first.value, first.text)
    //console.log(ExcelJS.ValueType)
    //console.log(Object.keys(workbook.worksheets[0]))
    //console.log(workbook.worksheets[0].properties)
}

testValues()
