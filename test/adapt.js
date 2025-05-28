const assert = require('assert')
const path = require('path')
const { adapt, analyze } = require('../index.js')

describe('adapt', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const testConfig = require(path.resolve(__dirname, './data/test-file-config.js'))
    it('SheetMissing', async function () {
        const errors = await analyze(testFile, testConfig)
        //console.table(errors)
        const adaption = adapt(testConfig, errors)
        console.log(adaption)
        /* assert.deepStrictEqual(adaption, {
            FileExists: { worksheet: 'TestSheet', type: 'object', fields: [] },
            InconsistentSheetName: { worksheet: 'InconsistentSheetName', type: 'object', fields: [] }
        }) */
    })
    it('InconsistentSheetName')
})
