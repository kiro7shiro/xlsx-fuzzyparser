module.exports = {
    NoErrors: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 4,
        columns: [
            { index: 2, key: 'col-1', header: 'one' },
            { index: 3, key: 'col-2', header: 'two' },
            { index: 4, key: 'col-3', header: 'three' }
        ]
    },
    InconsistentHeaderName: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 11,
        columns: [
            { index: 2, key: 'col-4', header: 'four' },
            { index: 3, key: 'col-5', header: 'five' },
            { index: 4, key: 'col-6', header: 'six' }
        ]
    },
    MissingDataHeader: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 18,
        columns: [
            { index: 2, key: 'col-7', header: 'seven' },
            { index: 3, key: 'col-8', header: 'eight' },
            { index: 4, key: 'col-9', header: 'nine' }
        ]
    },
    IncorrectRowIndex: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 25,
        columns: [
            { index: 2, key: 'col-10', header: 'ten' },
            { index: 3, key: 'col-11', header: 'eleven' },
            { index: 4, key: 'col-12', header: 'twelve' }
        ]
    },
    IncorrectColumnIndex: {
        worksheet: 'TestList',
        type: 'list',
        rowOffset: 33,
        columns: [
            { index: 2, key: 'col-13', header: 'thirteen' },
            { index: 3, key: 'col-14', header: 'fourteen' },
            { index: 4, key: 'col-15', header: 'fifteen' }
        ]
    }
}
