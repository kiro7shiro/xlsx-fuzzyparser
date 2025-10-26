const testConfig = {
    TestObject: {
        worksheet: 'TestObject',
        type: 'object',
        fields: [{ row: 1, col: 1, key: 'test' }]
    },
    TestList: {
        worksheet: 'TestList',
        type: 'list',
        row: 4,
        columns: [
            { index: 2, key: 'col-one', header: 'one' },
            { index: 3, key: 'col-two', header: 'two' },
            { index: 4, key: 'col-three', header: 'three' }
        ]
    }
}

module.exports = testConfig
