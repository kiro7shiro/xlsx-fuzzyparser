const billConfig = {
    costs: {
        worksheet: 'Kostenzusammenstellung',
        type: 'object',
        fields: [
            { row: 1, col: 1, key: 'event', mapper: (value) => String(value) },
            { row: 7, col: 2, key: 'halls', header: { text: 'Hallen', row: 7, col: 1 }, mapper: (value) => Number(value) },
            { row: 8, col: 2, key: 'traffics', header: { text: 'Verkehrsflächen', row: 8, col: 1 }, mapper: (value) => Number(value) },
            { row: 9, col: 2, key: 'sanitary', header: { text: 'Sanitärflächen', row: 9, col: 1 }, mapper: (value) => Number(value) },
            { row: 10, col: 2, key: 'toiletService', header: { text: 'WC Besetzung', row: 10, col: 1 }, mapper: (value) => Number(value) },
            { row: 11, col: 2, key: 'outdoor', header: { text: 'Aussengelände', row: 11, col: 1 }, mapper: (value) => Number(value) },
            { row: 12, col: 2, key: 'additionalService', header: { text: 'diverse Zusatzarbeiten', row: 12, col: 1 }, mapper: (value) => Number(value) },
            { row: 13, col: 2, key: 'adjoining-rooms', header: { text: 'Nebenräume MG', row: 13, col: 1 }, mapper: (value) => Number(value) },
            { row: 14, col: 2, key: 'ideal-areas', header: { text: 'Ideelle Flächen', row: 14, col: 1 }, mapper: (value) => Number(value) },
            { row: 15, col: 2, key: 'drk-station', header: { text: 'DRK-Stationen', row: 15, col: 1 }, mapper: (value) => Number(value) },
            { row: 16, col: 2, key: 'cash-desk', header: { text: 'Kassen', row: 16, col: 1 }, mapper: (value) => Number(value) },
            { row: 17, col: 2, key: 'additionally', header: { text: 'Zusatzarbeiten aus Hallenrücknahme', row: 17, col: 1 }, mapper: (value) => Number(value) }
        ]
    },
    halls: {
        worksheet: 'Hallen',
        type: 'list',
        rowOffset: 13,
        columns: [
            { index: 1, key: 'name', header: 'Halle', mapper: (value) => String(value) },
            { index: 2, key: 'area', header: 'Fläche', mapper: (value) => Number(value) },
            { index: 3, key: 'areaRate', header: 'Flächen-anteil', mapper: (value) => Number(value) },
            { index: 4, key: 'setupCleaning', header: 'VR Aufbau', mapper: (value) => Number(value) },
            { index: 5, key: 'preCleaning', header: 'Vor- reinig.', mapper: (value) => Number(value) },
            { index: 6, key: 'nightlyCleaning40%', header: 'lfd. VR Nacht', mapper: (value) => Number(value) },
            { index: 7, key: 'nightlyCleaning', header: 'lfd. VR Nacht', mapper: (value) => Number(value) },
            { index: 8, key: 'dailyCleaning40%', header: 'lfd. Tag', mapper: (value) => Number(value) },
            { index: 9, key: 'dailyCleaning', header: 'lfd. Tag', mapper: (value) => Number(value) },
            { index: 10, key: 'postCleaning', header: 'Nach-reinig.', mapper: (value) => Number(value) }
        ]
    },
    traffics: {
        worksheet: 'Verkehr',
        type: 'list',
        rowOffset: 11,
        columns: [
            { index: 1, key: 'name', header: 'Fläche' },
            { index: 2, key: 'details', header: 'Details/\nOrtsangabe' },
            { index: 3, key: 'floor', header: 'Ebene' },
            { index: 4, key: 'area', header: 'Fläche', mapper: (value) => Number(value) },
            { index: 5, key: 'dayCount', header: 'Tage', mapper: (value) => Number(value) },
            { index: 6, key: 'preCleaning', header: 'Vor-reinig.', mapper: (value) => Number(value) },
            { index: 7, key: 'nightlyCleaning', header: 'lfd. VR Nacht', mapper: (value) => Number(value) },
            { index: 8, key: 'dailyCleaning', header: 'lfd. Tag', mapper: (value) => Number(value) },
            { index: 9, key: 'postCleaning', header: 'NR', mapper: (value) => Number(value) }
        ]
    },
    sanitary: {
        worksheet: 'Sanitär',
        type: 'list',
        rowOffset: 14,
        columns: [
            { index: 1, key: 'name', header: 'Foyer' },
            { index: 2, key: 'details', header: 'Details/\nOrtsangabe' },
            { index: 3, key: 'floor', header: 'Ebene' },
            { index: 4, key: 'area', header: 'Fläche', mapper: (value) => Number(value) },
            { index: 5, key: 'ladycare', header: 'Ladycare-\nbehälter', mapper: (value) => Number(value) },
            { index: 6, key: 'setupCleaning', header: 'Aufbau', mapper: (value) => Number(value) },
            { index: 7, key: 'preCleaning', header: 'Vor-reinig.', mapper: (value) => Number(value) },
            { index: 8, key: 'nightlyCleaning', header: 'lfd. VR Nacht', mapper: (value) => Number(value) },
            { index: 9, key: 'dismantling', header: 'Abbau', mapper: (value) => Number(value) },
            { index: 10, key: 'postCleaning', header: 'Nach- reinig.', mapper: (value) => Number(value) }
        ]
    }
}

module.exports = billConfig
