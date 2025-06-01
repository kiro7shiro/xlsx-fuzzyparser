const { validateConfig, validateMultiConfig } = require('./config.js')
const { Errors: AnalysationErrors } = require('./analyze.js')

/**
 * Adapt a configuration to an invalid configured file
 * @param {Object} config to adapt to the file
 * @param {Array} errors to change the configuration
 * @returns {Object} a new object with the changed parameters
 */
function adapt(config, errors) {
    // copy config
    const adaption = JSON.parse(JSON.stringify(config))
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
                    return error instanceof AnalysationErrors.SheetMissing && error.sheetName === subConfig.worksheet
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
            // sheet
            const inconsistentName = errors.find(function (error) {
                return error instanceof AnalysationErrors.InconsistentSheetName && error.worksheet === config.worksheet
            })
            if (inconsistentName) adaption.worksheet = inconsistentName.sheetName
            // inconsistent headers
            const descriptors = adaption.type === 'object' ? adaption.fields : adaption.columns
            const inconsistentHeader = errors.filter(function (error) {
                return (
                    error instanceof AnalysationErrors.InconsistentHeaderName &&
                    descriptors.some(function (descriptor) {
                        return descriptor.key === error.key
                    })
                )
            })
            for (let iCnt = 0; iCnt < inconsistentHeader.length; iCnt++) {
                const error = inconsistentHeader[iCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.index]
                if (header) {
                    header.text = error.header
                }
            }
            // missing data headers
            const missingDataHeader = errors.filter(function (error) {
                return error instanceof AnalysationErrors.MissingDataHeader
            })
            for (let mCnt = 0; mCnt < missingDataHeader.length; mCnt++) {
                const error = missingDataHeader[mCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                descriptor.header[error.index] = null
            }
            if (missingDataHeader.length > 0) {
                // filter out removed headers
                for (let dCnt = 0; dCnt < descriptors.length; dCnt++) {
                    const descriptor = descriptors[dCnt]
                    descriptor.header = descriptor.header.filter(d => d !== null)
                }
            }
            // incorrect indexes
            // TODO : make a strategy for adapting the value position, too
            //        where should values be located in relation to their headers ??? 
            //        calc the estimated position based on the relative location in the config
            //        we can only check for data if a validator is present
            const incorrectIndex = errors.filter(function (error) {
                return error instanceof AnalysationErrors.IncorrectRowIndex || error instanceof AnalysationErrors.IncorrectColumnIndex
            })
            for (let iCnt = 0; iCnt < incorrectIndex.length; iCnt++) {
                const error = incorrectIndex[iCnt]
                const descriptor = descriptors.find(function (desc) {
                    return desc.key === error.key
                })
                const header = descriptor.header[error.header]
                if (error instanceof AnalysationErrors.IncorrectRowIndex) {
                    header.row = error.row
                } else {
                    header.col = error.column
                }
            }
    }

    return adaption
}

module.exports = { adapt }
