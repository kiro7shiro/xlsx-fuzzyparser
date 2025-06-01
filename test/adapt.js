const assert = require('assert')
const path = require('path')
const { adapt, analyze } = require('../index.js')

describe('adapt', function () {
    const testFile = path.resolve(__dirname, './data/test-file.xlsx')
    const testFileConfig = require(path.resolve(__dirname, './data/test-file-config.js'))
    const testListConfig = require(path.resolve(__dirname, './data/test-list-config.js'))
    const testObjectConfig = require(path.resolve(__dirname, './data/test-object-config.js'))
    const testMultiConfig = require(path.resolve(__dirname, './data/test-list-multiCellHeaders-config.js'))
    describe('sheet', function () {
        it('SheetMissing', async function () {
            const missingConfig = {
                SheetMissing: testFileConfig.SheetMissing
            }
            const errors = await analyze(testFile, missingConfig)
            const adaption = adapt(missingConfig, errors)
            assert.deepStrictEqual(adaption, {})
        })
        it('InconsistentSheetName', async function () {
            const inconsistentSheetConfig = {
                InconsistentSheetName: testFileConfig.InconsistentSheetName
            }
            const errors = await analyze(testFile, inconsistentSheetConfig)
            const adaption = adapt(inconsistentSheetConfig, errors)
            assert.deepStrictEqual(adaption, {
                InconsistentSheetName: { worksheet: 'InconsistentSheetName_', type: 'object', fields: [] }
            })
        })
    })
    describe('list', function () {
        it('InconsistentHeaderName', async function () {
            const inconsistentHeader = testListConfig.InconsistentHeaderName
            const errors = await analyze(testFile, inconsistentHeader)
            //console.table(errors)
            const adaption = adapt(inconsistentHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.index]
                assert.strictEqual(header.text, error.header)
            }
        })
        it('MissingDataHeader', async function () {
            const missingDataHeader = testListConfig.MissingDataHeader
            const errors = await analyze(testFile, missingDataHeader)
            //console.table(errors)
            const adaption = adapt(missingDataHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let dCnt = 0; dCnt < descriptors.length; dCnt++) {
                const descriptor = descriptors[dCnt]
                assert.strictEqual(descriptor.header.length, 0)
            }
        })
        it('IncorrectRowIndex', async function () {
            const incorrectRowIndex = testListConfig.IncorrectRowIndex
            const errors = await analyze(testFile, incorrectRowIndex)
            //console.table(errors)
            const adaption = adapt(incorrectRowIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.row, error.index)
            }
        })
        it('IncorrectColumnIndex', async function () {
            const incorrectColumnIndex = testListConfig.IncorrectColumnIndex
            const errors = await analyze(testFile, incorrectColumnIndex)
            //console.table(errors)
            const adaption = adapt(incorrectColumnIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.col, error.index)
            }
        })
    })
    describe('object', function () {
        it('InconsistentHeaderName', async function () {
            const inconsistentHeader = testObjectConfig.InconsistentHeaderName
            const errors = await analyze(testFile, inconsistentHeader)
            //console.table(errors)
            const adaption = adapt(inconsistentHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.index]
                assert.strictEqual(header.text, error.header)
            }
        })
        it('MissingDataHeader', async function () {
            const missingDataHeader = testObjectConfig.MissingDataHeader
            const errors = await analyze(testFile, missingDataHeader)
            //console.table(errors)
            const adaption = adapt(missingDataHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let dCnt = 0; dCnt < descriptors.length; dCnt++) {
                const descriptor = descriptors[dCnt]
                assert.strictEqual(descriptor.header.length, 0)
            }
        })
        it('IncorrectRowIndex', async function () {
            const incorrectRowIndex = testObjectConfig.IncorrectRowIndex
            const errors = await analyze(testFile, incorrectRowIndex)
            //console.table(errors)
            const adaption = adapt(incorrectRowIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.row, error.index)
            }
        })
        it('IncorrectColumnIndex', async function () {
            const incorrectColumnIndex = testObjectConfig.IncorrectColumnIndex
            const errors = await analyze(testFile, incorrectColumnIndex)
            //console.table(errors)
            const adaption = adapt(incorrectColumnIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.col, error.index)
            }
        })
    })
    describe('MultiCellHeaders', function () {
        it('InconsistentHeaderName', async function () {
            const inconsistentHeader = testMultiConfig.InconsistentHeaderName
            const errors = await analyze(testFile, inconsistentHeader)
            //console.table(errors)
            const adaption = adapt(inconsistentHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.index]
                assert.strictEqual(header.text, error.header)
            }
        })
        it('MissingDataHeader', async function () {
            const missingDataHeader = testMultiConfig.MissingDataHeader
            const errors = await analyze(testFile, missingDataHeader)
            //console.table(errors)
            const adaption = adapt(missingDataHeader, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let dCnt = 0; dCnt < descriptors.length; dCnt++) {
                const descriptor = descriptors[dCnt]
                assert.strictEqual(descriptor.header.length, 0)
            }
        })
        it('IncorrectRowIndex', async function () {
            const incorrectRowIndex = testMultiConfig.IncorrectRowIndex
            const errors = await analyze(testFile, incorrectRowIndex)
            //console.table(errors)
            const adaption = adapt(incorrectRowIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.row, error.index)
            }
        })
        it('IncorrectColumnIndex', async function () {
            const incorrectColumnIndex = testMultiConfig.IncorrectColumnIndex
            const errors = await analyze(testFile, incorrectColumnIndex)
            //console.table(errors)
            const adaption = adapt(incorrectColumnIndex, errors)
            //console.log(adaption)
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            for (let eCnt = 0; eCnt < errors.length; eCnt++) {
                const error = errors[eCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                assert.strictEqual(header.col, error.index)
            }
        })
    })
})
