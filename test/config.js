const assert = require('assert')
const path = require('path')
const { validateConfig, validateMultiConfig } = require('../src/config.js')

describe('config', function () {
    const config = require(path.resolve(__dirname, './data/test-config.js'))
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
    it('is not a multi config', function () {
        const [key, value] = Object.entries(config)[0]
        const isMultiConfig = validateMultiConfig(value)
        assert.strictEqual(isMultiConfig, false)
    })
    it('is not a config', function () {
        const isConfig = validateConfig(config)
        assert.strictEqual(isConfig, false)
    })
})
