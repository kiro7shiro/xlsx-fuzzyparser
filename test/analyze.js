const assert = require('assert')
const path = require('path')
const { validate, Errors } = require('../src/analyze.js')

describe('validate', function () {
    const filename = path.resolve(__dirname, './data/tpk-liste-05-01-2023.xlsx')
    const config = require(path.resolve(__dirname, './data/tpk-daten-config.js'))
    it('FileNotExists', async function () {
        await assert.rejects(validate('./missing.xlsx', config), Errors.FileNotExists)
    })
    it('ConfigInvalid', async function () {
        await assert.rejects(validate(filename, {}), Errors.ConfigInvalid)
    })
    it('SheetMissing', async function () {
        const configCopy = Object.assign({}, config, { worksheet: 'missing' })
        const [error] = await validate(filename, configCopy)
        assert.ok(error instanceof Errors.SheetMissing, `Expected error to be an instance of 'SheetMissing' but got: '${error.constructor.name}'`)
    })
    it('InconsistentSheetName', async function () {
        const configCopy = Object.assign({}, config, { worksheet: 'Table' })
        const [error] = await validate(filename, configCopy)
        assert.ok(
            error instanceof Errors.InconsistentSheetName,
            `Expected error to be an instance of 'InconsistentSheetName' but got: '${error.constructor.name}'`
        )
    })
    it('ColumnHeadersNotFound', async function () {
        const noHeadersFile = path.resolve(__dirname, './data/tpk-liste-no-headers.xlsx')
        const [error] = await validate(noHeadersFile, config)
        assert.ok(
            error instanceof Errors.ColumnHeadersNotFound,
            `Expected error to be an instance of 'ColumnHeadersNotFound' but got: '${error.constructor.name}'`
        )
    })
    it('IncorrectRowOffset', async function () {
        const [error] = await validate(filename, config)
        assert.ok(error instanceof Errors.IncorrectRowOffset, `Expected error to be an instance of 'IncorrectRowOffset' but got: '${error.constructor.name}'`)
    })
})
