const assert = require('assert')
const path = require('path')
const { analyze, Errors } = require('../index.js')

// TODO : rewrite config to new test style in doc file
// TODO : rewrite tests

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
		assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
		if (errors.length) console.table(errors)
	})
	it('InconsistentHeader', async function () {
		const { InconsistentHeader: config } = testConfig
		const errors = await analyze(testFile, config)
		console.table(errors)
		assert.ok(errors.length === 0, `Expected errors length to be 0 but got: '${errors.length}'`)
		if (errors.length) console.table(errors)
	})
	it('MissingHeader')
	it('IncorrectRow')
	it('IncorrectColumn')
})
