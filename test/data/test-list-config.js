// TODO : rename rowOffset into row
// TODO : rename index into column
module.exports = {
    NoErrors: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 4,
        columns: [
            { index: 2, key: 'col-1', header: [{ text: 'one', row: 4, col: 2 }] },
            { index: 3, key: 'col-2', header: [{ text: 'two', row: 4, col: 3 }] },
            { index: 4, key: 'col-3', header: [{ text: 'three', row: 4, col: 4 }] }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 11,
        columns: [
            { index: 2, key: 'col-4', header: [{ text: 'four', row: 11, col: 2 }] },
            { index: 3, key: 'col-5', header: [{ text: 'five', row: 11, col: 3 }] },
            { index: 4, key: 'col-6', header: [{ text: 'six', row: 11, col: 4 }] }
        ]
    },
    MissingDataHeader: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 18,
        columns: [
            { index: 2, key: 'col-7', header: [{ text: 'seven', row: 18, col: 2 }] },
            { index: 3, key: 'col-8', header: [{ text: 'eight', row: 18, col: 3 }] },
            { index: 4, key: 'col-9', header: [{ text: 'nine', row: 18, col: 4 }] }
        ]
    },
    IncorrectRowIndex: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 25,
        columns: [
            { index: 2, key: 'col-10', header: [{ text: 'ten', row: 25, col: 2 }] },
            { index: 3, key: 'col-11', header: [{ text: 'eleven', row: 25, col: 3 }] },
            { index: 4, key: 'col-12', header: [{ text: 'twelve', row: 25, col: 4 }] }
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 33,
        columns: [
            { index: 2, key: 'col-13', header: [{ text: 'thirteen', row: 33, col: 2 }] },
            { index: 3, key: 'col-14', header: [{ text: 'fourteen', row: 33, col: 3 }] },
            { index: 4, key: 'col-15', header: [{ text: 'fifteen', row: 33, col: 4 }] }
        ]
    },
    MultiCellHeaders: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 40,
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
    }
}
