const { parse } = require('./src/parse.js')
const { adapt, validate } = require('./src/analyze.js')

module.exports = {
    adapt,
    parse,
    validate
}