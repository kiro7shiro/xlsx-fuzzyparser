const { analyze, Errors: AnalysationErrors } = require('./src/analyze.js')
const { adapt } = require('./src/adapt.js')
const { parse, Errors: ParsingErrors } = require('./src/parse.js')

const Errors = { ...AnalysationErrors, ...ParsingErrors }

module.exports = {
    analyze,
    adapt,
    parse,
    Errors
}
