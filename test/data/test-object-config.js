module.exports = {
    NoErrors: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 5, col: 3, key: 'field-one', header: { text: 'one', row: 5, col: 2 } },
            { row: 5, col: 4, key: 'field-two', header: { text: 'two', row: 4, col: 4 } },
            { row: 5, col: 5, key: 'field-three', header: { text: 'three', row: 5, col: 6 } },
            { row: 5, col: 7, key: 'field-four', header: { text: 'four', row: 6, col: 7 } }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 11, col: 2, key: 'field-five', header: { text: 'five', row: 11, col: 2 } },
            { row: 10, col: 4, key: 'field-six', header: { text: 'six', row: 10, col: 4 } },
            { row: 11, col: 6, key: 'field-seven', header: { text: 'seven', row: 11, col: 6 } },
            { row: 12, col: 7, key: 'field-eight', header: { text: 'eight', row: 12, col: 7 } }
        ]
    },
    MissingDataHeader: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 17, col: 2, key: 'field-nine', header: { text: 'nine', row: 17, col: 2 } },
            { row: 17, col: 4, key: 'field-ten', header: { text: 'ten', row: 16, col: 4 } },
            { row: 17, col: 6, key: 'field-eleven', header: { text: 'eleven', row: 17, col: 6 } },
            { row: 18, col: 7, key: 'field-twelve', header: { text: 'twelve', row: 18, col: 7 } }
        ]
    },
    IncorrectRowIndex: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 23, col: 3, key: 'field-thirteen', header: { text: 'thirteen', row: 23, col: 2 } },
            { row: 22, col: 4, key: 'field-fourteen', header: { text: 'fourteen', row: 22, col: 4 } },
            { row: 23, col: 6, key: 'field-fifteen', header: { text: 'fifteen', row: 23, col: 6 } },
            { row: 24, col: 7, key: 'field-sixteen', header: { text: 'sixteen', row: 24, col: 7 } }
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [
            { row: 30, col: 3, key: 'field-seventeen', header: { text: 'seventeen', row: 30, col: 2 } },
            { row: 30, col: 4, key: 'field-eighteen', header: { text: 'eighteen', row: 29, col: 4 } },
            { row: 30, col: 5, key: 'field-nineteen', header: { text: 'nineteen', row: 30, col: 6 } },
            { row: 30, col: 7, key: 'field-twenty', header: { text: 'twenty', row: 31, col: 7 } }
        ]
    }
}
