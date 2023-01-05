const assert = require('assert')
const path = require('path')
const { validateConfig, validateMultiConfig } = require('../src/xlsx-schema.js')

describe('xlsx-schema', function () {
    const config = require(path.resolve(__dirname, './data/bill-config.js'))
    it('is a multi config', async function () {
        const isMultiConfig = validateMultiConfig(config)
        assert.strictEqual(isMultiConfig, true)
    })
    it('is a single config', function () {
        for (const [key, value] of Object.entries(config)) {
            const isConfig = validateConfig(value)
            assert.strictEqual(isConfig, true)
        }
    })
})
