module.exports = {
    NoErrors: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 5, col: 3, key: 'field-1', header: [{ text: 'one', row: 5, col: 2 }] },
            { row: 5, col: 4, key: 'field-2', header: [{ text: 'two', row: 4, col: 4 }] },
            { row: 5, col: 5, key: 'field-3', header: [{ text: 'three', row: 5, col: 6 }] },
            { row: 5, col: 7, key: 'field-4', header: [{ text: 'four', row: 6, col: 7 }] }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 11, col: 2, key: 'field-5', header: [{ text: 'five', row: 11, col: 2 }] },
            { row: 10, col: 4, key: 'field-6', header: [{ text: 'six', row: 10, col: 4 }] },
            { row: 11, col: 6, key: 'field-7', header: [{ text: 'seven', row: 11, col: 6 }] },
            { row: 12, col: 7, key: 'field-8', header: [{ text: 'eight', row: 12, col: 7 }] }
        ]
    },
    MissingDataHeader: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 17, col: 2, key: 'field-9', header: [{ text: 'nine', row: 17, col: 2 }] },
            { row: 17, col: 4, key: 'field-10', header: [{ text: 'ten', row: 16, col: 4 }] },
            { row: 17, col: 6, key: 'field-11', header: [{ text: 'eleven', row: 17, col: 6 }] },
            { row: 18, col: 7, key: 'field-12', header: [{ text: 'twelve', row: 18, col: 7 }] }
        ]
    },
    IncorrectRowIndex: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 23, col: 3, key: 'field-13', header: [{ text: 'thirteen', row: 23, col: 2 }] },
            { row: 22, col: 4, key: 'field-14', header: [{ text: 'fourteen', row: 22, col: 4 }] },
            { row: 23, col: 6, key: 'field-15', header: [{ text: 'fifteen', row: 23, col: 6 }] },
            { row: 24, col: 7, key: 'field-16', header: [{ text: 'sixteen', row: 24, col: 7 }] }
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 30, col: 3, key: 'field-17', header: [{ text: 'seventeen', row: 30, col: 2 }] },
            { row: 30, col: 4, key: 'field-18', header: [{ text: 'eighteen', row: 29, col: 4 }] },
            { row: 30, col: 5, key: 'field-19', header: [{ text: 'nineteen', row: 30, col: 6 }] },
            { row: 30, col: 7, key: 'field-20', header: [{ text: 'twenty', row: 31, col: 7 }] }
        ]
    },
    MultiCellHeaders: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            {
                row: 37,
                col: 2,
                key: 'field-21',
                header: [
                    { text: 'twenty', row: 35, col: 2 },
                    { text: 'one', row: 36, col: 2 }
                ]
            },
            {
                row: 35,
                col: 5,
                key: 'field-22',
                header: [
                    { text: 'twenty', row: 35, col: 3 },
                    { text: 'tow', row: 35, col: 4 }
                ]
            },
            {
                row: 37,
                col: 6,
                key: 'field-23',
                header: [
                    { text: 'twenty', row: 35, col: 6 },
                    { text: 'three', row: 36, col: 6 }
                ]
            },
            {
                row: 35,
                col: 9,
                key: 'field-24',
                header: [
                    { text: 'twenty', row: 35, col: 7 },
                    { text: 'one', row: 36, col: 8 }
                ]
            },
            {
                row: 35,
                col: 14,
                key: 'field-25',
                header: [
                    { text: 'twenty', row: 35, col: 12 },
                    { text: 'one', row: 36, col: 13 }
                ]
            }
        ]
    }
}
