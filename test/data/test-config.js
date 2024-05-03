const testConfig = {
    SheetMissing: {
        worksheet: 'ThisNameIsMissing',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    },
    InconsistentSheetName: {
        worksheet: 'InconsistentSheetName',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    },
    ColumnHeadersMissing: {
        worksheet: 'ColumnHeadersMissing',
        type: 'list',
        rowOffset: 3,
        columns: [
            { index: 2, key: 'col-one' },
            { index: 3, key: 'col-two' },
            { index: 4, key: 'col-three' }
        ],
        columnHeaders: [
            ['col-1', 'col-2', 'col-3']
        ]
    },
    IncorrectRowOffset: {
        worksheet: 'IncorrectRowOffset',
        type: 'list',
        rowOffset: 3,
        columns: [
            { index: 2, key: 'col-one' },
            { index: 3, key: 'col-two' },
            { index: 4, key: 'col-three' }
        ],
        columnHeaders: [
            ['col-1', 'col-2', 'col-3']
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'IncorrectColumnIndex',
        type: 'list',
        rowOffset: 3,
        columns: [
            { index: 2, key: 'col-one' },
            { index: 3, key: 'col-two' },
            { index: 4, key: 'col-three' }
        ],
        columnHeaders: [
            ['col-1', 'col-2', 'col-3']
        ]
    }
}

module.exports = testConfig
