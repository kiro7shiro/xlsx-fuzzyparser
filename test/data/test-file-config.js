module.exports = {
    FileExists: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    },
    SheetMissing: {
        worksheet: 'ThisNameIsMissing',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    },
    InconsistentSheetName: {
        worksheet: 'InconsistentSheetName',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    }
}