module.exports = {
    NoErrors: {
        worksheet: 'Object',
        type: 'object',
        fields: [
            { row: 7, col: 3, key: 'field-1', header: [{ text: 'one', row: 7, col: 2 }] },
            { row: 7, col: 4, key: 'field-2', header: [{ text: 'two', row: 8, col: 4 }] },
            { row: 7, col: 5, key: 'field-3', header: [{ text: 'three', row: 7, col: 6 }] },
            { row: 7, col: 7, key: 'field-4', header: [{ text: 'four', row: 8, col: 7 }] },
            {
                row: 12,
                col: 2,
                key: 'field-21',
                header: [
                    { text: 'twenty', row: 10, col: 2 },
                    { text: 'one', row: 11, col: 2 }
                ]
            },
            {
                row: 10,
                col: 5,
                key: 'field-22',
                header: [
                    { text: 'twenty', row: 10, col: 3 },
                    { text: 'tow', row: 10, col: 4 }
                ]
            }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'Object',
        type: 'object',
        fields: [
            { row: 19, col: 3, key: 'field-5', header: [{ text: 'five', row: 19, col: 2 }] },
            { row: 19, col: 4, key: 'field-6', header: [{ text: 'six', row: 18, col: 4 }] },
            { row: 19, col: 5, key: 'field-7', header: [{ text: 'seven', row: 19, col: 6 }] },
            { row: 19, col: 7, key: 'field-8', header: [{ text: 'eight', row: 20, col: 7 }] },
            {
                row: 24,
                col: 2,
                key: 'field-23',
                header: [
                    { text: 'twenty', row: 22, col: 2 },
                    { text: 'three', row: 23, col: 2 }
                ]
            },
            {
                row: 22,
                col: 5,
                key: 'field-24',
                header: [
                    { text: 'twenty', row: 22, col: 3 },
                    { text: 'one', row: 22, col: 4 }
                ]
            }
        ]
    },
    IncorrectHeaderColumn: {
        worksheet: 'Object',
        type: 'object',
        fields: [
            { row: 31, col: 3, key: 'field-17', header: [{ text: 'seventeen', row: 31, col: 2 }] },
            { row: 31, col: 4, key: 'field-18', header: [{ text: 'eighteen', row: 31, col: 4 }] },
            { row: 31, col: 5, key: 'field-19', header: [{ text: 'nineteen', row: 31, col: 6 }] },
            { row: 31, col: 7, key: 'field-20', header: [{ text: 'twenty', row: 32, col: 7 }] },
            {
                row: 35,
                col: 3,
                key: 'field-27',
                header: [
                    { text: 'twenty', row: 34, col: 2 },
                    { text: 'seven', row: 35, col: 2 }
                ]
            },
            {
                row: 36,
                col: 4,
                key: 'field-28',
                header: [
                    { text: 'twenty', row: 36, col: 2 },
                    { text: 'seven', row: 36, col: 3 }
                ]
            }
        ]
    },
    IncorrectHeaderRow: {
        worksheet: 'Object',
        type: 'object',
        fields: [
            { row: 44, col: 3, key: 'field-13', header: [{ text: 'thirteen', row: 44, col: 2 }] },
            { row: 44, col: 4, key: 'field-14', header: [{ text: 'fourteen', row: 43, col: 4 }] },
            { row: 44, col: 5, key: 'field-15', header: [{ text: 'fifteen', row: 44, col: 6 }] },
            { row: 44, col: 7, key: 'field-16', header: [{ text: 'sixteen', row: 45, col: 7 }] },
            {
                row: 50,
                col: 2,
                key: 'field-25',
                header: [
                    { text: 'twenty', row: 48, col: 2 },
                    { text: 'seven', row: 49, col: 2 }
                ]
            },
            {
                row: 48,
                col: 5,
                key: 'field-26',
                header: [
                    { text: 'twenty', row: 48, col: 3 },
                    { text: 'seven', row: 48, col: 4 }
                ]
            }
        ]
    },
    MissingDataHeader: {
        worksheet: 'Object',
        type: 'object',
        fields: [
            { row: 17, col: 3, key: 'field-9', header: [{ text: 'nine', row: 17, col: 2 }] },
            { row: 17, col: 4, key: 'field-10', header: [{ text: 'ten', row: 16, col: 4 }] },
            { row: 17, col: 5, key: 'field-11', header: [{ text: 'eleven', row: 17, col: 6 }] },
            { row: 17, col: 7, key: 'field-12', header: [{ text: 'twelve', row: 18, col: 7 }] }
        ]
    },
    EmptyDataCell: {
        worksheet: 'Object',
        type: 'object',
        fields: []
    }
}
