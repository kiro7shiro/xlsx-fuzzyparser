module.exports = {
    FileExists: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: []
    },
    SheetMissing: {
        sheetName: 'ThisNameIsMissing',
        type: 'object',
        fields: []
    },
    InconsistentSheetName: {
        sheetName: 'InconsistentSheetName',
        type: 'object',
        fields: []
    },
    base: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 2,
                column: 3,
                key: 'Data2-3',
                headers: [{ text: 'Header2-2', row: 2, column: 2 }]
            },
            {
                row: 2,
                column: 5,
                key: 'Data2-5',
                headers: [{ text: 'Header2-6', row: 2, column: 6 }]
            },
            {
                row: 3,
                column: 8,
                key: 'Data3-8',
                headers: [{ text: 'Header2-8', row: 2, column: 8 }]
            },
            {
                row: 2,
                column: 10,
                key: 'Data2-10',
                headers: [{ text: 'Header3-10', row: 3, column: 10 }]
            },
            {
                row: 3,
                column: 14,
                key: 'Data3-14',
                headers: [
                    { text: 'Header3-12', row: 3, column: 12 },
                    { text: 'Header3-13', row: 3, column: 13 }
                ]
            }
        ]
    },
    InconsistentHeader: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 7,
                column: 3,
                key: 'Data7-3',
                headers: [{ text: 'Header7-2', row: 7, column: 2 }]
            },
            {
                row: 7,
                column: 5,
                key: 'Data7-5',
                headers: [{ text: 'Header7-6', row: 7, column: 6 }]
            },
            {
                row: 8,
                column: 8,
                key: 'Data8-8',
                headers: [{ text: 'Header7-8', row: 7, column: 8 }]
            },
            {
                row: 7,
                column: 10,
                key: 'Data7-10',
                headers: [{ text: 'Header8-10', row: 8, column: 10 }]
            }
        ]
    },
    MissingHeader: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 11,
                column: 3,
                key: 'Data11-3',
                headers: [{ text: 'Header11-2', row: 11, column: 2 }]
            },
            {
                row: 11,
                column: 5,
                key: 'Data11-5',
                headers: [{ text: 'Header11-6', row: 11, column: 6 }]
            },
            {
                row: 11,
                column: 14,
                key: 'Data11-14',
                headers: [
                    { text: 'Header11-12', row: 11, column: 12 },
                    { text: 'Header11-13', row: 11, column: 13 }
                ]
            },
            {
                row: 11,
                column: 26,
                key: 'Data11-26',
                headers: [
                    { text: 'Header11-24', row: 11, column: 24 },
                    { text: 'Header11-25', row: 11, column: 25 }
                ]
            },
            {
                row: 11,
                column: 32,
                key: 'Data11-32',
                headers: [
                    { text: 'Header11-29', row: 11, column: 29 },
                    { text: 'Header11-30', row: 11, column: 30 },
                    { text: 'Header11-31', row: 11, column: 31 }
                ]
            }
        ]
    },
    IncorrectRow: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 17,
                column: 3,
                key: 'Data17-3',
                headers: [{ text: 'Header17-2', row: 17, column: 2 }]
            },
            {
                row: 17,
                column: 10,
                key: 'Data17-10',
                headers: [
                    { text: 'Header17-8', row: 17, column: 8 },
                    { text: 'Header17-9', row: 17, column: 9 }
                ]
            },
            {
                row: 17,
                column: 15,
                key: 'Data17-15',
                headers: [
                    { text: 'Header17-13', row: 17, column: 13 },
                    { text: 'Header17-14', row: 17, column: 14 }
                ]
            }
        ]
    },
    IncorrectColumn: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 24,
                column: 4,
                key: 'Data24-4',
                headers: [{ text: 'Header24-3', row: 24, column: 3 }]
            },
            {
                row: 24,
                column: 11,
                key: 'Data24-11',
                headers: [
                    { text: 'Header24-9', row: 24, column: 9 },
                    { text: 'Header24-10', row: 24, column: 10 }
                ]
            },
            {
                row: 24,
                column: 17,
                key: 'Data24-17',
                headers: [
                    { text: 'Header24-15', row: 24, column: 15 },
                    { text: 'Header24-16', row: 24, column: 16 }
                ]
            }
        ]
    },
    IncorrectColumnAndRow: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 27,
                column: 4,
                key: 'Data27-4',
                headers: [{ text: 'Header27-3', row: 27, column: 3 }]
            },
            {
                row: 27,
                column: 11,
                key: 'Data27-11',
                headers: [
                    { text: 'Header27-9', row: 27, column: 9 },
                    { text: 'Header27-10', row: 27, column: 10 }
                ]
            },
            {
                row: 27,
                column: 17,
                key: 'Data27-17',
                headers: [
                    { text: 'Header27-15', row: 27, column: 15 },
                    { text: 'Header27-16', row: 27, column: 16 }
                ]
            }
        ]
    },
    EmptyDataCell: {
        sheetName: 'TestSheet',
        type: 'object',
        fields: [
            {
                row: 31,
                column: 3,
                key: 'Data31-3',
                headers: [{ text: 'Header31-2', row: 31, column: 2 }]
            },
            {
                row: 31,
                column: 10,
                key: 'Data31-10',
                headers: [
                    { text: 'Header31-8', row: 31, column: 8 },
                    { text: 'Header31-9', row: 31, column: 9 }
                ]
            },
            {
                row: 31,
                column: 15,
                key: 'Data31-15',
                headers: [
                    { text: 'Header31-13', row: 31, column: 13 },
                    { text: 'Header31-14', row: 31, column: 14 }
                ]
            },
            {
                row: 31,
                column: 20,
                key: 'Data31-20',
                headers: [{ text: 'Header31-19', row: 31, column: 19 }]
            }
        ]
    }
}
