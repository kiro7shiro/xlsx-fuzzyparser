module.exports = {
    NoErrors: {
        worksheet: 'TestList',
        type: 'list',
        row: 40,
        columns: [
            {
                index: 2,
                key: 'col-16',
                header: [{ text: 'sixteen', row: 41, col: 2 }]
            },
            {
                index: 3,
                key: 'col-17',
                header: [
                    { text: 'seven', row: 40, col: 3 },
                    { text: 'teen', row: 41, col: 3 }
                ]
            },
            {
                index: 4,
                key: 'col-18',
                header: [
                    { text: 'eight', row: 41, col: 4 },
                    { text: 'teen', row: 41, col: 5 }
                ]
            }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'TestList',
        type: 'list',
        row: 50,
        columns: [
            {
                index: 2,
                key: 'col-19',
                header: [
                    { text: 'nine', row: 48, col: 2 },
                    { text: 'teen', row: 49, col: 2 }
                ]
            },
            {
                index: 3,
                key: 'col-20',
                header: [{ text: 'twenty', row: 48, col: 3 }]
            },
            {
                index: 4,
                key: 'col-21',
                header: [
                    { text: 'twenty', row: 49, col: 4 },
                    { text: 'one', row: 49, col: 5 }
                ]
            }
        ]
    },
    MissingDataHeader: {
        worksheet: 'TestList',
        type: 'list',
        row: 58,
        columns: [
            {
                index: 2,
                key: 'col-22',
                header: [{ text: 'twenty two', row: 57, col: 2 }]
            },
            {
                index: 3,
                key: 'col-23',
                header: [
                    { text: 'twenty', row: 56, col: 3 },
                    { text: 'three', row: 57, col: 3 }
                ]
            },
            {
                index: 3,
                key: 'col-24',
                header: [{ text: 'twenty four', row: 56, col: 4 }]
            }
        ]
    },
    IncorrectRowIndex: {
        worksheet: 'TestList',
        type: 'list',
        row: 66,
        columns: [
            {
                index: 2,
                key: 'col-25',
                header: [{ text: 'twenty five', row: 65, col: 2 }]
            },
            {
                index: 3,
                key: 'col-26',
                header: [
                    { text: 'twenty', row: 64, col: 3 },
                    { text: 'six', row: 65, col: 3 }
                ]
            },
            {
                index: 3,
                key: 'col-27',
                header: [
                    { text: 'Twenty', row: 65, col: 4 },
                    { text: 'seven', row: 65, col: 5 }
                ]
            }
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'TestList',
        type: 'list',
        row: 76,
        columns: [
            {
                index: 2,
                key: 'col-28',
                header: [{ text: 'twenty eight', row: 75, col: 2 }]
            },
            {
                index: 3,
                key: 'col-29',
                header: [
                    { text: 'twenty', row: 74, col: 3 },
                    { text: 'nine', row: 75, col: 3 }
                ]
            },
            {
                index: 4,
                key: 'col-30',
                header: [
                    { text: 'thir', row: 75, col: 4 },
                    { text: 'ty', row: 75, col: 5 }
                ]
            }
        ]
    }
}
