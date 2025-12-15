const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../index.js')

// TODO
// [ ] : rewrite config to new test style in doc file
// [ ] : rewrite tests

describe('analyze', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const testConfig = require(path.resolve(__dirname, './data/test-config.js'))
    it('FileExists', async function () {
        const { FileExists: config } = testConfig
        const errors = await analyze(testFile, config)
        assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
    })
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
        assert.strictEqual(error.worksheet, config.worksheet)
    })
    it('InconsistentSheetName', async function () {
        const { InconsistentSheetName: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.log(errors)
        const [error] = errors
        assert.ok(
            error instanceof Errors.InconsistentSheetName,
            `Expected error to be an instance of 'InconsistentSheetName' but got: '${error.constructor.name}'`
        )
        assert.strictEqual(error.inconsistentName, 'InconsistentSheetName_')
    })
    it('base', async function () {
        const { base: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
        if (errors.length) console.table(errors)
    })
    it('InconsistentHeader', async function () {
        const { InconsistentHeader: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        assert.ok(errors.length === 4, `Expected errors length to be 4 but got: '${errors.length}'`)
        const expected = ['HeAder7-2', 'headeR7-6', 'heAdeR7-8', 'heA_eR8-10']
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const header = expected[eCnt]
            assert.strictEqual(error.header, header)
        }
    })
    it('MissingHeader', async function () {
        const { MissingHeader: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = ['Header11-2', 'Header11-9', 'Header11-18', 'Header11-24', 'Header11-25']
        assert.ok(errors.length === 5, `Expected errors length to be 5 but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const header = expected[eCnt]
            assert.strictEqual(error.header, header)
        }
    })
    it('IncorrectRow')
    it('IncorrectColumn')
})
