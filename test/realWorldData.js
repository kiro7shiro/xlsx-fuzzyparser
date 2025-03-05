const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../src/analyze.js')

describe('RealWorldData', function () {
    it('Newline BillFile - NoErrors', async function () {
        const newlineTestFile = path.resolve(__dirname, './data/real/test-newline-file.xlsx')
        const newlineConfig = require(path.resolve(__dirname, './data/real/test-newline-config.js'))
        const { halls: config } = newlineConfig
        const errors = await analyze(newlineTestFile, config)
        //console.table(errors, ['name', 'worksheet', 'key', 'index', 'header', 'sheetName'])
        assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
    })
})
