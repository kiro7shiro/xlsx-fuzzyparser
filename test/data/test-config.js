module.exports = {
    FileExists: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: []
    },
    SheetMissing: {
        worksheet: 'ThisNameIsMissing',
        type: 'object',
        fields: []
    },
    InconsistentSheetName: {
        worksheet: 'InconsistentSheetName',
        type: 'object',
        fields: []
    },
    base: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            { row: 2, col: 3, key: 'Data2-3', header: [{ text: 'Header2-2', row: 2, col: 2 }] },
            { row: 2, col: 5, key: 'Data2-5', header: [{ text: 'Header2-6', row: 2, col: 6 }] },
            { row: 3, col: 8, key: 'Data3-8', header: [{ text: 'Header2-8', row: 2, col: 8 }] },
            { row: 2, col: 10, key: 'Data2-10', header: [{ text: 'Header3-10', row: 3, col: 10 }] },
            {
                row: 3,
                col: 20,
                key: 'Data3-20',
                header: [
                    { text: 'Header3-18', row: 3, col: 18 },
                    { text: 'Header3-19', row: 3, col: 19 }
                ]
            }
        ]
    },
    InconsistentHeader: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            { row: 7, col: 3, key: 'Data7-3', header: [{ text: 'Header7-2', row: 7, col: 2 }] },
            { row: 7, col: 5, key: 'Data7-5', header: [{ text: 'Header7-6', row: 7, col: 6 }] },
            { row: 8, col: 8, key: 'Data8-8', header: [{ text: 'Header7-8', row: 7, col: 8 }] },
            { row: 7, col: 10, key: 'Data7-10', header: [{ text: 'Header8-10', row: 8, col: 10 }] }
        ]
    },
    MissingHeader: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            { row: 11, col: 3, key: 'Data11-3', header: [{ text: 'Header11-2', row: 11, col: 2 }] },
            { row: 11, col: 8, key: 'Data11-8', header: [{ text: 'Header11-9', row: 11, col: 9 }] },
            {
                row: 11,
                col: 20,
                key: 'Data11-20',
                header: [
                    { text: 'Header11-18', row: 11, col: 18 },
                    { text: 'Header11-19', row: 11, col: 19 }
                ]
            },
            {
                row: 11,
                col: 26,
                key: 'Data11-26',
                header: [
                    { text: 'Header11-24', row: 11, col: 24 },
                    { text: 'Header11-25', row: 11, col: 25 }
                ]
            },
            {
                row: 11,
                col: 32,
                key: 'Data11-32',
                header: [
                    { text: 'Header11-29', row: 11, col: 29 },
                    { text: 'Header11-30', row: 11, col: 30 },
                    { text: 'Header11-31', row: 11, col: 31 }
                ]
            }
        ]
    },
    IncorrectRow: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            { row: 17, col: 3, key: 'Data17-3', header: [{ text: 'Header17-2', row: 17, col: 2 }] },
            {
                row: 17,
                col: 10,
                key: 'Data17-10',
                header: [
                    { text: 'Header17-8', row: 17, col: 8 },
                    { text: 'Header17-9', row: 17, col: 9 }
                ]
            },
            {
                row: 17,
                col: 15,
                key: 'Data17-15',
                header: [
                    { text: 'Header17-13', row: 17, col: 13 },
                    { text: 'Header17-14', row: 17, col: 14 }
                ]
            }
        ]
    },
    IncorrectColumn: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            { row: 24, col: 4, key: 'Data24-4', header: [{ text: 'Header24-3', row: 24, col: 3 }] },
            { row: 24, col: 9, key: 'Data24-9', header: [{ text: 'Header24-8', row: 24, col: 8 }] },
            { row: 24, col: 15, key: 'Data24-15', header: [{ text: 'Header24-14', row: 24, col: 14 }] },
            {
                row: 24,
                col: 21,
                key: 'Data24-21',
                header: [
                    { text: 'Header24-19', row: 24, col: 19 },
                    { text: 'Header24-20', row: 24, col: 20 }
                ]
            },
            {
                row: 24,
                col: 26,
                key: 'Data24-26',
                header: [
                    { text: 'Header24-24', row: 24, col: 24 },
                    { text: 'Header24-25', row: 24, col: 25 }
                ]
            },
            {
                row: 24,
                col: 33,
                key: 'Data24-33',
                header: [
                    { text: 'Header17-30', row: 17, col: 30 },
                    { text: 'Header17-31', row: 17, col: 31 }
                ]
            }
        ]
    }
}
