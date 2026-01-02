// TODO 
// [ ] : redefine schema to add descriptors
// [ ] : redefine schema to add headers
// [x] : rename header to headers in configs descriptors
// [x] : rename col to column in headers
// [x] : rename worksheet to sheetName
// [ ] : add parsers to configuration
const Ajv = require("ajv")

const columnsSchema = {
    $id: 'columns',
    type: 'array',
    minItems: 0,
    items: {
        type: 'object',
        properties: {
            index: { type: 'integer' },
            key: { type: 'string' },
        },
        required: ['index', 'key']
    }
}

const fieldsSchema = {
    $id: 'fields',
    type: 'array',
    minItems: 0,
    items: {
        type: 'object',
        properties: {
            row: { type: 'integer' },
            column: { type: 'integer' },
            key: { type: 'string' },
        },
        required: ['row', 'column', 'key']
    }
}

const configSchema = {
    $id: 'config',
    type: 'object',
    properties: {
        type: { type: 'string', pattern: 'list\\b|object\\b' },
        sheetName: { type: 'string', minLength: 1 },
        row: { type: 'integer' },
        columns: { $ref: 'columns' },
        fields: { $ref: 'fields' }
    },
    required: ['type', 'sheetName'],
    if: { properties: { type: { type: 'string', pattern: 'list\\b' } } },
    then: { required: ['columns'] },
    else: {
        if: { properties: { type: { type: 'string', pattern: 'object\\b' } } },
        then: { required: ['fields'] }
    },
    additionalProperties: true
}

const multiConfigSchema = {
    $id: 'multiConfig',
    type: 'object',
    minProperties: 1,
    patternProperties: {
        '^[a-z]+': { $ref: 'config' }
    }
}

const ajv = new Ajv({
    schemas: [columnsSchema, fieldsSchema, configSchema, multiConfigSchema],
    allErrors: true
})
const validateColumns = ajv.getSchema('columns')
const validateFields = ajv.getSchema('fields')
const validateConfig = ajv.getSchema('config')
const validateMultiConfig = ajv.getSchema('multiConfig')

module.exports = {
    validateColumns,
    validateFields,
    validateConfig,
    validateMultiConfig
}