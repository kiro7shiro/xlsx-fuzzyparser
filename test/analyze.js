const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../index.js')

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
        assert.strictEqual(error.worksheet, config.sheetName)
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
        const expected = ['HeAder7-2', 'headeR7-6', 'heAdeR7-8', 'heA_eR8-10']
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.strictEqual(error.header, expect)
        }
    })
    it('MissingHeader', async function () {
        const { MissingHeader: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = ['Header11-2', 'Header11-6', 'Header11-12', 'Header11-24', 'Header11-25', 'Header11-29', 'Header11-31']
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.strictEqual(error.header, expect)
        }
    })
    it('IncorrectRow', async function () {
        const { IncorrectRow: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = [
            { key: 'Data17-3', row: 18, header: 0 },
            { key: 'Data17-10', row: 16, header: 0 },
            { key: 'Data17-10', row: 16, header: 1 },
            { key: 'Data17-15', row: 16, header: 0 },
            { key: 'Data17-15', row: 18, header: 1 }
        ]
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.strictEqual(error.key, expect.key)
            assert.strictEqual(error.row, expect.row)
            assert.strictEqual(error.header, expect.header)
        }
    })
    it('IncorrectColumn', async function () {
        const { IncorrectColumn: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = [
            { key: 'Data24-4', column: 2, header: 0 },
            { key: 'Data24-11', column: 8, header: 0 },
            { key: 'Data24-11', column: 9, header: 1 },
            { key: 'Data24-17', column: 13, header: 0 },
            { key: 'Data24-17', column: 15, header: 1 }
        ]
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.strictEqual(error.key, expect.key)
            assert.strictEqual(error.column, expect.column)
            assert.strictEqual(error.header, expect.header)
        }
    })
    it('IncorrectPositions', async function () {
        const { IncorrectColumnAndRow: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = [
            { key: 'Data27-4', row: 28, header: 0 },
            { key: 'Data27-4', column: 2, header: 0 },
            { key: 'Data27-11', row: 28, header: 0 },
            { key: 'Data27-11', column: 8, header: 0 },
            { key: 'Data27-11', row: 28, header: 1 },
            { key: 'Data27-11', column: 9, header: 1 },
            { key: 'Data27-17', row: 28, header: 0 },
            { key: 'Data27-17', column: 13, header: 0 },
            { key: 'Data27-17', row: 28, header: 1 },
            { key: 'Data27-17', column: 15, header: 1 }
        ]
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.strictEqual(error.key, expect.key)
            assert.strictEqual(error.header, expect.header)
            if (Object.hasOwn(error, 'row')) {
                assert.strictEqual(error.row, expect.row)
            } else {
                assert.strictEqual(error.column, expect.column)
            }
        }
    })
    it('EmptyDataCell', async function () {
        const { EmptyDataCell: config } = testConfig
        const errors = await analyze(testFile, config)
        //console.table(errors)
        const expected = [{ key: 'Data31-3' }, { key: 'Data31-10' }, { key: 'Data31-15' }, { key: 'Data31-20' }]
        assert.ok(errors.length === expected.length, `Expected errors length to be ${expected.length} but got: '${errors.length}'`)
        for (let eCnt = 0; eCnt < errors.length; eCnt++) {
            const error = errors[eCnt]
            const expect = expected[eCnt]
            assert.ok(error instanceof Errors.EmptyDataCell, `Expected error to be an instance of 'EmptyDataCell' but got: '${error.constructor.name}'`)
            assert.strictEqual(error.key, expect.key)
        }
    })
})
