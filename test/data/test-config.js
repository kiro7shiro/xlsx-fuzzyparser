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
            {
                row: 2,
                col: 3,
                key: 'Data2-3',
                header: [{ text: 'Header2-2', row: 2, col: 2 }]
            },
            {
                row: 2,
                col: 5,
                key: 'Data2-5',
                header: [{ text: 'Header2-6', row: 2, col: 6 }]
            },
            {
                row: 3,
                col: 8,
                key: 'Data3-8',
                header: [{ text: 'Header2-8', row: 2, col: 8 }]
            },
            {
                row: 2,
                col: 10,
                key: 'Data2-10',
                header: [{ text: 'Header3-10', row: 3, col: 10 }]
            },
            {
                row: 3,
                col: 14,
                key: 'Data3-14',
                header: [
                    { text: 'Header3-12', row: 3, col: 12 },
                    { text: 'Header3-13', row: 3, col: 13 }
                ]
            }
        ]
    },
    InconsistentHeader: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 7,
                col: 3,
                key: 'Data7-3',
                header: [{ text: 'Header7-2', row: 7, col: 2 }]
            },
            {
                row: 7,
                col: 5,
                key: 'Data7-5',
                header: [{ text: 'Header7-6', row: 7, col: 6 }]
            },
            {
                row: 8,
                col: 8,
                key: 'Data8-8',
                header: [{ text: 'Header7-8', row: 7, col: 8 }]
            },
            {
                row: 7,
                col: 10,
                key: 'Data7-10',
                header: [{ text: 'Header8-10', row: 8, col: 10 }]
            }
        ]
    },
    MissingHeader: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 11,
                col: 3,
                key: 'Data11-3',
                header: [{ text: 'Header11-2', row: 11, col: 2 }]
            },
            {
                row: 11,
                col: 5,
                key: 'Data11-5',
                header: [{ text: 'Header11-6', row: 11, col: 6 }]
            },
            {
                row: 11,
                col: 14,
                key: 'Data11-14',
                header: [
                    { text: 'Header11-12', row: 11, col: 12 },
                    { text: 'Header11-13', row: 11, col: 13 }
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
            {
                row: 17,
                col: 3,
                key: 'Data17-3',
                header: [{ text: 'Header17-2', row: 17, col: 2 }]
            },
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
            {
                row: 24,
                col: 4,
                key: 'Data24-4',
                header: [{ text: 'Header24-3', row: 24, col: 3 }]
            },
            {
                row: 24,
                col: 11,
                key: 'Data24-11',
                header: [
                    { text: 'Header24-9', row: 24, col: 9 },
                    { text: 'Header24-10', row: 24, col: 10 }
                ]
            },
            {
                row: 24,
                col: 17,
                key: 'Data24-17',
                header: [
                    { text: 'Header24-15', row: 24, col: 15 },
                    { text: 'Header24-16', row: 24, col: 16 }
                ]
            }
        ]
    },
    IncorrectColumnAndRow: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 27,
                col: 4,
                key: 'Data27-4',
                header: [{ text: 'Header27-3', row: 27, col: 3 }]
            },
            {
                row: 27,
                col: 11,
                key: 'Data27-11',
                header: [
                    { text: 'Header27-9', row: 27, col: 9 },
                    { text: 'Header27-10', row: 27, col: 10 }
                ]
            },
            {
                row: 27,
                col: 17,
                key: 'Data27-17',
                header: [
                    { text: 'Header27-15', row: 27, col: 15 },
                    { text: 'Header27-16', row: 27, col: 16 }
                ]
            }
        ]
    },
    EmptyDataCell: {
        worksheet: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 31,
                col: 3,
                key: 'Data31-3',
                header: [{ text: 'Header31-2', row: 31, col: 2 }]
            },
            {
                row: 31,
                col: 10,
                key: 'Data31-10',
                header: [
                    { text: 'Header31-8', row: 31, col: 8 },
                    { text: 'Header31-9', row: 31, col: 9 }
                ]
            },
            {
                row: 31,
                col: 15,
                key: 'Data31-15',
                header: [
                    { text: 'Header31-13', row: 31, col: 13 },
                    { text: 'Header31-14', row: 31, col: 14 }
                ]
            },
            {
                row: 31,
                col: 20,
                key: 'Data31-20',
                header: [{ text: 'Header31-19', row: 31, col: 19 }]
            }
        ]
    }
}
