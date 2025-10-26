# xlsx-fuzzyparser

Parse *.xslx files into data objects using fuzzy search.

When you work in a place where your colleagues don't always follow the standard, but you still want to programmatically extract the data from those files. Then this library is for you.

## Features
- Fuzzy search for data headers
- Support for multiple worksheets
- Easy-to-use API for extracting data

## Use Cases
- Extracting data from Excel files with inconsistent formatting

Getting Started
To use this library, simply install it using npm or yarn, and then import it into your project. See the documentation for more information on how to use the library.

## Program flow
- analyze   : Analyze an excel file against a given configuration object and return the differences as an array of errors.
- adapt     : Adapt a configuration object to a misconfigured file using errors from analyzing step.
- parse     : Parse data of an excel file with a given config and return the data.
- serialize : Serialize data with a given config into an excel file and save it.
- validate  : Validate data against a validator and return the differences as an array of errors.