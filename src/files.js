/**
 * Module for handling file related functions
 * retrieving file data
 * save an index.json file nearby the opened files
 * load file index if a json file is present nearby
 */

function getWorkbookData(workbook) {}

function getWorksheetData(worksheet) {
    // FIXME : empty merged cells produce an error when trying to create a fuse index
    // FIXME : make the error check in the loop more robust if possible
    const data = []
    worksheet.eachRow(function (row) {
        row.eachCell(function (cell) {
            try {
                // the next statement is the actual error check
                // if we can't access the text property of a cell
                // it will be filtered out of our data
                const check = cell.text
                data.push(cell)
            } catch (error) {}
        })
    })
    return data
}

module.exports = {
    getWorksheetData
}
