const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../src/analyze.js')

describe('analyze', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const testConfig = require(path.resolve(__dirname, './data/test-config.js'))
    it('FileNotExists', async function () {
        await assert.rejects(analyze('./missing.xlsx', testConfig), Errors.FileNotExists)
    })
    it('ConfigInvalid', async function () {
        await assert.rejects(analyze(testFile, {}), Errors.ConfigInvalid)
    })
    it('SheetMissing', async function () {
        const { SheetMissing: config } = testConfig
        const [error] = await analyze(testFile, config)
        assert.ok(error instanceof Errors.SheetMissing, `Expected error to be an instance of 'SheetMissing' but got: '${error.constructor.name}'`)
    })
    it('InconsistentSheetName', async function () {
        const { InconsistentSheetName: config } = testConfig
        const [error] = await analyze(testFile, config)
        assert.ok(
            error instanceof Errors.InconsistentSheetName,
            `Expected error to be an instance of 'InconsistentSheetName' but got: '${error.constructor.name}'`
        )
        assert.strictEqual(error.actual, 'InconsistentSheetName_')
    })
    it('ColumnHeadersMissing', async function () {
        const { ColumnHeadersMissing: config } = testConfig
        const [error] = await analyze(testFile, config)
        assert.ok(
            error instanceof Errors.ColumnHeadersMissing,
            `Expected error to be an instance of 'ColumnHeadersMissing' but got: '${error.constructor.name}'`
        )
    })
    it('IncorrectRowOffset', async function () {
        const { IncorrectRowOffset: config } = testConfig
        const [error] = await analyze(testFile, config)
        assert.ok(error instanceof Errors.IncorrectRowOffset, `Expected error to be an instance of 'IncorrectRowOffset' but got: '${error.constructor.name}'`)
        assert.strictEqual(error.actual, 4)
    })
    it('IncorrectColumnIndex', async function () {
        const { IncorrectColumnIndex: config } = testConfig
        const [error1, error2, error3] = await analyze(testFile, config)
        assert.ok(
            error1 instanceof Errors.IncorrectColumnIndex,
            `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error1.constructor.name}'`
        )
        assert.strictEqual(error1.actual, 3)
        assert.ok(
            error2 instanceof Errors.IncorrectColumnIndex,
            `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error2.constructor.name}'`
        )
        assert.strictEqual(error2.actual, 4)
        assert.ok(
            error3 instanceof Errors.IncorrectColumnIndex,
            `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error3.constructor.name}'`
        )
        assert.strictEqual(error3.actual, 5)
    })
    it('IncorrectRowIndex')
    it('InconsistentHeaderName')
    it('MissingDataHeader')
    it('DataHeaderNotInConfig')
})
