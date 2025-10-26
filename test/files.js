const assert = require('assert')
const path = require('path')
const ExcelJS = require('exceljs')
const { loadIndex, saveIndex, getWorksheetData, getWorkbook } = require('../src/files.js')

describe('files', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    describe('caching', function () {
        it('getWorkbook', async function () {
            const workbook = await getWorkbook(testFile)
            assert.ok(workbook instanceof ExcelJS.Workbook, 'Workbook should be an instance of ExcelJS.Workbook.')
            // TODO : implement more checks for the resulting workbook
        })
    })
    describe('indexing', function () {
        it('loadIndex', async function () {
            this.timeout(15000)
            this.slow(10000)
            // Initial load of the index
            const index = await loadIndex(testFile)
            assert.ok(index, 'Initial index file should be loaded.')
            assert.ok(Object.hasOwn(index, 'Indexing'), 'Indexing property should be loaded.')
            // Simulate a file change by modifying the file
            const oldChange = index.Indexing.records[1]['$']['0']['v']
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Indexing')
            let change = testSheet.getRow(1).getCell(2).value
            change = change === 0 ? 1 : 0
            testSheet.getRow(1).getCell(2).value = change
            await workbook.xlsx.writeFile(testFile)
            const index2 = await loadIndex(testFile)
            const newChange = index2.Indexing.records[1]['$']['0']['v']
            assert.ok(oldChange !== newChange, 'Index file should be rebuild after file changed.')
        })
        it('saveIndex', async function () {
            this.timeout(15000)
            this.slow(10000)
            const indexFile = path.resolve(__dirname, './data/test-file-index.json')
            const index = await saveIndex(indexFile)
            assert.ok(index, 'Initial index file should be loaded.')
            assert.ok(Object.hasOwn(index, 'Indexing'), 'Indexing property should be loaded.')
        })
        it('load *.json index', async function () {
            const indexFile = path.resolve(__dirname, './data/test-file-index.json')
            const index = await loadIndex(indexFile)
            assert.ok(index, 'Initial index file should be loaded.')
            assert.ok(Object.hasOwn(index, 'Indexing'), 'Indexing property should be loaded.')
        })
    })
    describe('getWorksheetData', function () {
        it('load cells', async function () {
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Data')
            let data = getWorksheetData(testSheet)
            assert.strictEqual(data.length, 152, `Data should be 152 items but got:${data.length}`)
            assert.strictEqual(data[0].text, 'Column1', `First item should have text "Column1" but got:${data[0].text}`)
        })
        it('load selected cells', async function () {
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Data')
            let row1 = getWorksheetData(testSheet, { rowCount: 1 })
            assert.strictEqual(row1.length, 8, `Row one should have 8 items but got:${row1.length}`)
            assert.strictEqual(row1[0].address, 'A1', `Row one first item should have address: A1 but got:${row1[0].address}`)
            assert.strictEqual(row1[7].address, 'H1', `Row one last item should have address: H1 but got:${row1[7].address}`)
            let square = getWorksheetData(testSheet, { startRow: 9, rowCount: 4, startCol: 3, colCount: 4 })
            assert.strictEqual(square.length, 16, `Square should have 16 items but got:${square.length}`)
            assert.strictEqual(square[0].address, 'C9', `Square first item should have address: C9 but got:${square[0].address}`)
            assert.strictEqual(square[15].address, 'F12', `Square last item should have address: F12 but got:${square[15].address}`)
        })
        it('load and unmerge cells', async function () {
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.readFile(testFile)
            let testSheet = workbook.getWorksheet('Merged')
            let data = getWorksheetData(testSheet)
            assert.strictEqual(data.length, 16, `data should have 16 items but got:${data.length}`)
            assert.strictEqual(data[0].text, 'Column1 Merge1', `data[0] should have text "Column1 Merge1" but got:${data[0].text}`)
            assert.strictEqual(data[2].text, 'Column3 Merge2', `data[2] should have text "Column2 Merge2" but got:${data[2].text}`)
        })
    })
})