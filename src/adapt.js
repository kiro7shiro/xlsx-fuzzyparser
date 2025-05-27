const { validateConfig, validateMultiConfig } = require('./config.js')
const { Errors: AnalysationErrors } = require('./analyze.js')

/**
 * Adapt a configuration to an invalid configured file
 * @param {Object} config to adapt to the file
 * @param {Array} errors to change the configuration
 * @returns {Object} a new object with the changed parameters
 */
function adapt(config, errors) {
    const adaption = Object.assign({}, config)
    // validate config and use the results as flags
    const isConfig = validateConfig(config)
    const isMultiConfig = validateMultiConfig(config)
    switch (true) {
        case !isConfig && !isMultiConfig:
            // configuration error
            throw new AnalysationErrors.ConfigInvalid([...validateConfig.errors, ...validateMultiConfig.errors])

        case isMultiConfig:
            // adapt a multi config
            for (const key in adaption) {
                const subConfig = adaption[key]
                const noSheet = errors.find(function (error) {
                    return error.name === 'SheetMissing' && error.worksheet === subConfig.worksheet
                })
                if (noSheet) {
                    delete adaption[key]
                } else {
                    adaption[key] = adapt(subConfig, errors)
                }
            }
            break

        case isConfig:
            // adapt a single config
            const invalidName = errors.find(function (error) {
                return error.name === 'InconsistentSheetName' && error.worksheet === config.worksheet
            })
            if (invalidName) adaption.worksheet = invalidName.actual
            const invalidRowOffset = errors.find(function (error) {
                return error.name === 'IncorrectRowOffset' && error.worksheet === adaption.worksheet
            })
            if (invalidRowOffset) adaption.rowOffset = invalidRowOffset.actual
            if (adaption.columns) {
                // adapt columns
                for (let cCnt = 0; cCnt < adaption.columns.length; cCnt++) {
                    const column = adaption.columns[cCnt]
                    const invalidColIndex = errors.find(function (error) {
                        return error.name === 'IncorrectColumnIndex' && error.key === column.key
                    })
                    if (invalidColIndex) column.index = invalidColIndex.actual
                }
                // TODO : missing data headers
                const missingDataHeaders = errors.filter(function (error) {
                    return error.name === 'MissingDataHeader'
                })
            } else {
            }
            // TODO : strategy for adapting empty values? set to zero or null string
            break
    }

    return adaption
}

module.exports = { adapt }
