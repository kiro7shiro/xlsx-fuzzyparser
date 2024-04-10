const assert = require('assert')
const path = require('path')
const { validate, Errors } = require('../src/analyze.js')

// TODO : test bill files

describe('validate', function () {
    const filename = path.resolve(__dirname, './data/tpk-liste-05-01-2023.xlsx')
    const tpkDataConfig = require(path.resolve(__dirname, './data/tpk-daten-config.js'))
    const billConfig = require(path.resolve(__dirname, './data/bill-config'))
    it('FileNotExists', async function () {
        await assert.rejects(validate('./missing.xlsx', tpkDataConfig), Errors.FileNotExists)
    })
    it('ConfigInvalid', async function () {
        await assert.rejects(validate(filename, {}), Errors.ConfigInvalid)
    })
    it('SheetMissing', async function () {
        const configCopy = Object.assign({}, tpkDataConfig, { worksheet: 'missing' })
        const [error] = await validate(filename, configCopy)
        assert.ok(
            error instanceof Errors.SheetMissing,
            `Expected error to be an instance of 'SheetMissing' but got: '${error.constructor.name}'`
        )
    })
    it('InconsistentSheetName', async function () {
        const configCopy = Object.assign({}, tpkDataConfig, { worksheet: 'Table' })
        const [error] = await validate(filename, configCopy)
        assert.ok(
            error instanceof Errors.InconsistentSheetName,
            `Expected error to be an instance of 'InconsistentSheetName' but got: '${error.constructor.name}'`
        )
    })
    it('ColumnHeadersNotFound', async function () {
        const noHeadersFile = path.resolve(__dirname, './data/tpk-liste-no-headers.xlsx')
        const [error] = await validate(noHeadersFile, tpkDataConfig)
        assert.ok(
            error instanceof Errors.ColumnHeadersNotFound,
            `Expected error to be an instance of 'ColumnHeadersNotFound' but got: '${error.constructor.name}'`
        )
    })
    it('IncorrectRowOffset', async function () {
        const [error] = await validate(filename, tpkDataConfig)
        assert.ok(
            error instanceof Errors.IncorrectRowOffset,
            `Expected error to be an instance of 'IncorrectRowOffset' but got: '${error.constructor.name}'`
        )
    })
    it('IncorrectColumnIndex', async function () {
        // TODO : add test for bill configs here, too
        const configCopy = Object.assign({}, tpkDataConfig, { rowOffset: 1 })
        const [error] = await validate(filename, configCopy)
        assert.ok(
            error instanceof Errors.IncorrectColumnIndex,
            `Expected error to be an instance of 'IncorrectColumnIndex' but got: '${error.constructor.name}'`
        )
    })
    it('IncorrectRowIndex')
    it('InconsistentHeaderName')
    it('MissingDataHeader', async function () {
        // TODO : add test for bill configs here, too
        const missHeaderFile = path.resolve(__dirname, './data/tpk-liste-missing-header.xlsx')
        const errors = await validate(missHeaderFile, tpkDataConfig)
        const [error] = errors.filter(function (err) {
            return err instanceof Errors.MissingDataHeader
        })
        assert.ok(
            error instanceof Errors.MissingDataHeader,
            `Expected error to be an instance of 'MissingDataHeader' but got: '${error.constructor.name}'`
        )
    })
    it('DataHeaderNotInConfig', async function () {
        const addHeadersFile = path.resolve(__dirname, './data/tpk-liste-add-headers.xlsx')
        const errors = await validate(addHeadersFile, tpkDataConfig)
        const [error] = errors.filter(function (err) {
            return err instanceof Errors.DataHeaderNotInConfig
        })
        assert.ok(
            error instanceof Errors.DataHeaderNotInConfig,
            `Expected error to be an instance of 'DataHeaderNotInConfig' but got: '${error.constructor.name}'`
        )
    })
    it('billFiles', async function () {
        const billFile = path.resolve(__dirname, './data/newline-billFile.xlsx')
        const errors = await validate(billFile, billConfig)
        console.log(errors)
    })
    it('InvalidData')
    
})

