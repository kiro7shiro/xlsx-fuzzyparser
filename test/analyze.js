const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../index.js')

describe('analyze', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    describe('file', function () {
        const fileConfig = require(path.resolve(__dirname, './data/test-file-config.js'))
        it('FileExists', async function () {
            const { FileExists: config } = fileConfig
            const errors = await analyze(testFile, config)
            assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
        })
        it('FileNotExists', async function () {
            await assert.rejects(analyze('./missing.xlsx', fileConfig), Errors.FileNotExists)
        })
        it('ConfigInvalid', async function () {
            await assert.rejects(analyze(testFile, {}), Errors.ConfigInvalid)
        })
        it('SheetMissing', async function () {
            const { SheetMissing: config } = fileConfig
            const [error] = await analyze(testFile, config)
            assert.ok(error instanceof Errors.SheetMissing, `Expected error to be an instance of 'SheetMissing' but got: '${error.constructor.name}'`)
            assert.strictEqual(error.sheetName, config.worksheet)
        })
        it('InconsistentSheetName', async function () {
            const { InconsistentSheetName: config } = fileConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            const [error] = errors
            assert.ok(
                error instanceof Errors.InconsistentSheetName,
                `Expected error to be an instance of 'InconsistentSheetName' but got: '${error.constructor.name}'`
            )
            assert.strictEqual(error.sheetName, 'InconsistentSheetName_')
        })
    })
    describe('list', function () {
        const listConfig = require(path.resolve(__dirname, './data/test-list-config.js'))
        it('NoErrors', async function () {
            const { NoErrors: config } = listConfig
            const errors = await analyze(testFile, config)
            assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
        })
        it('InconsistentHeaderName', async function () {
            const { InconsistentHeaderName: config } = listConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3] = errors
            assert.ok(
                error1 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error1.constructor.name}'`
            )
            assert.ok(error1.header === 'fouRr', `Expected error1.header equal to: 'fouRr' but got: '${error1.header}'`)
            assert.ok(error2.header === 'fiVe_', `Expected error2.header equal to: 'fiVe_' but got: '${error2.header}'`)
            assert.ok(error3.header === 'Six!', `Expected error3.header equal to: 'Six!' but got: '${error3.header}'`)
        })
        it('MissingDataHeader', async function () {
            const { MissingDataHeader: config } = listConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3] = errors
            assert.ok(
                error1 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error1.constructor.name}'`
            )
            assert.ok(error1.header === 'seven', `Expected error1.header equal to: 'seven' but got: '${error1.header}'`)
            assert.ok(error2.header === 'eight', `Expected error2.header equal to: 'eight' but got: '${error2.header}'`)
            assert.ok(error3.header === 'nine', `Expected error3.header equal to: 'nine' but got: '${error3.header}'`)
        })
        it('IncorrectRowIndex', async function () {
            const { IncorrectRowIndex: config } = listConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(error1.row === 26, `Expected error1.row equal to: 26 but got: '${error1.row}'`)
            assert.ok(error2.row === 26, `Expected error2.row equal to: 26 but got: '${error2.row}'`)
            assert.ok(error3.row === 26, `Expected error3.row equal to: 26 but got: '${error3.row}'`)
        })
        it('IncorrectColumnIndex', async function () {
            const { IncorrectColumnIndex: config } = listConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error3.constructor.name}'`
            )
            assert.ok(error1.column === 5, `Expected error1.column equal to: 5 but got: '${error1.column}'`)
            assert.ok(error2.column === 6, `Expected error2.column equal to: 6 but got: '${error2.column}'`)
            assert.ok(error3.column === 7, `Expected error3.column equal to: 7 but got: '${error3.column}'`)
        })
    })
    describe('object', function () {
        const objectConfig = require(path.resolve(__dirname, './data/test-object-config.js'))
        it('NoErrors', async function () {
            const { NoErrors: config } = objectConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
        })
        it('InconsistentHeaderName', async function () {
            const { InconsistentHeaderName: config } = objectConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error1.constructor.name}' for field-5`
            )
            assert.ok(
                error2 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error2.constructor.name}' for field-6`
            )
            assert.ok(
                error3 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error3.constructor.name}' for field-7`
            )
            assert.ok(
                error4 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error4.constructor.name}' for field-8`
            )
            assert.ok(error1.header === 'Fivee', `Expected error1.header equal to: 'Fivee' but got: '${error1.header}'`)
            assert.ok(error2.header === 'sixss', `Expected error2.header equal to: 'sixss' but got: '${error2.header}'`)
            assert.ok(error3.header === 'seVenn', `Expected error3.header equal to: 'seVenn' but got: '${error3.header}'`)
            assert.ok(error4.header === 'Eight_', `Expected error4.header equal to: 'Eight_' but got: '${error4.header}'`)
        })
        it('MissingDataHeader', async function () {
            const { MissingDataHeader: config } = objectConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error4.constructor.name}'`
            )
            assert.ok(error1.header === 'nine', `Expected error1.header equal to: 'nine' but got: '${error1.header}'`)
            assert.ok(error2.header === 'ten', `Expected error2.header equal to: 'ten' but got: '${error2.header}'`)
            assert.ok(error3.header === 'eleven', `Expected error3.header equal to: 'eleven' but got: '${error3.header}'`)
            assert.ok(error4.header === 'twelve', `Expected error4.header equal to: 'twelve' but got: '${error4.header}'`)
        })
        it('IncorrectRowIndex', async function () {
            const { IncorrectRowIndex: config } = objectConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error4.constructor.name}'`
            )
            assert.ok(error1.row === 24, `Expected error1.row equal to: 24 but got: '${error1.row}'`)
            assert.ok(error2.row === 23, `Expected error2.row equal to: 23 but got: '${error2.row}'`)
            assert.ok(error3.row === 24, `Expected error3.row equal to: 24 but got: '${error3.row}'`)
            assert.ok(error4.row === 25, `Expected error4.row equal to: 25 but got: '${error4.row}'`)
        })
        it('IncorrectColumnIndex', async function () {
            const { IncorrectColumnIndex: config } = objectConfig
            const errors = await analyze(testFile, config)
            //console.table(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error4.constructor.name}'`
            )
            assert.ok(error1.column === 3, `Expected error1.column equal to: 3 but got: '${error1.column}'`)
            assert.ok(error2.column === 5, `Expected error2.column equal to: 5 but got: '${error2.column}'`)
            assert.ok(error3.column === 7, `Expected error3.column equal to: 7 but got: '${error3.column}'`)
            assert.ok(error4.column === 8, `Expected error4.column equal to: 8 but got: '${error4.column}'`)
        })
    })
    describe('MultiCellHeaders', async function () {
        const multiConfig = require(path.resolve(__dirname, './data/test-list-multiCellHeaders-config.js'))
        it('NoErrors', async function () {
            const { NoErrors: config } = multiConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
        })
        it('InconsistentHeaderName', async function () {
            const { InconsistentHeaderName: config } = multiConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.InconsistentHeaderName,
                `Expected error to be an instance of 'InconsistentHeaderName' but got: '${error4.constructor.name}'`
            )
            assert.ok(error1.header === 'nine9', `Expected error1.header equal to: 'nine9' but got: '${error1.header}'`)
            assert.ok(error2.header === 'Twentyy', `Expected error2.header equal to: 'Twentyy' but got: '${error2.header}'`)
            assert.ok(error3.header === 'twe_ty', `Expected error3.header equal to: 'twe_ty' but got: '${error3.header}'`)
            assert.ok(error4.header === 'one1', `Expected error4.header equal to: 'one1' but got: '${error4.header}'`)
        })
        it('MissingDataHeader', async function () {
            const { MissingDataHeader: config } = multiConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            const [error1, error2, error3, error4] = errors
            assert.ok(
                error1 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.MissingDataHeader,
                `Expected error to be an instance of 'MissingDataHeader' but got: '${error4.constructor.name}'`
            )
            assert.ok(error1.header === 'twenty two', `Expected error1.header equal to: 'twenty two' but got: '${error1.header}'`)
            assert.ok(error2.header === 'twenty', `Expected error2.header equal to: 'twenty' but got: '${error2.header}'`)
            assert.ok(error3.header === 'three', `Expected error3.header equal to: 'three' but got: '${error3.header}'`)
            assert.ok(error4.header === 'twenty four', `Expected error4.header equal to: 'twenty four' but got: '${error4.header}'`)
        })
        it('IncorrectRowIndex', async function () {
            const { IncorrectRowIndex: config } = multiConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            const [error1, error2, error3, error4, error5] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error4.constructor.name}'`
            )
            assert.ok(
                error5 instanceof Errors.IncorrectRowIndex,
                `Expected error to be an instance of 'IncorrectRowIndex' but got: '${error5.constructor.name}'`
            )
            assert.ok(error1.row === 67, `Expected error1.row equal to: 67 but got: '${error1.row}'`)
            assert.ok(error2.row === 66, `Expected error2.row equal to: 66 but got: '${error2.row}'`)
            assert.ok(error3.row === 67, `Expected error3.row equal to: 67 but got: '${error3.row}'`)
            assert.ok(error4.row === 67, `Expected error4.row equal to: 67 but got: '${error4.row}'`)
            assert.ok(error5.row === 67, `Expected error5.row equal to: 67 but got: '${error5.row}'`)
        })
        it('IncorrectColumnIndex', async function () {
            const { IncorrectColumnIndex: config } = multiConfig
            const errors = await analyze(testFile, config)
            //console.log(errors)
            const [error1, error2, error3, error4, error5] = errors
            assert.ok(
                error1 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error1.constructor.name}'`
            )
            assert.ok(
                error2 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error2.constructor.name}'`
            )
            assert.ok(
                error3 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error3.constructor.name}'`
            )
            assert.ok(
                error4 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error4.constructor.name}'`
            )
            assert.ok(
                error5 instanceof Errors.IncorrectColumnIndex,
                `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error5.constructor.name}'`
            )
            assert.ok(error1.column === 6, `Expected error1.column equal to: 6 but got: '${error1.column}'`)
            assert.ok(error2.column === 7, `Expected error2.column equal to: 7 but got: '${error2.column}'`)
            assert.ok(error3.column === 7, `Expected error3.column equal to: 7 but got: '${error3.column}'`)
            assert.ok(error4.column === 8, `Expected error4.column equal to: 8 but got: '${error4.column}'`)
            assert.ok(error5.column === 9, `Expected error5.column equal to: 9 but got: '${error5.column}'`)
        })
    })
})
