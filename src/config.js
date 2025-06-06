// TODO : redefine schema to add headers
// TODO : rename col to column in headers
// TODO : rename worksheet to sheetName
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
            col: { type: 'integer' },
            key: { type: 'string' },
        },
        required: ['row', 'col', 'key']
    }
}

const configSchema = {
    $id: 'config',
    type: 'object',
    properties: {
        type: { type: 'string', pattern: 'list\\b|object\\b' },
        worksheet: { type: 'string', minLength: 1 },
        row: { type: 'integer' },
        columns: { $ref: 'columns' },
        fields: { $ref: 'fields' }
    },
    required: ['type', 'worksheet'],
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