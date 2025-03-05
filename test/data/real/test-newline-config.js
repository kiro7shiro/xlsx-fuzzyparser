const billConfig = {
    costs: {
        worksheet: 'Kostenzusammenstellung',
        type: 'object',
        fields: [
            { row: 1, col: 1, key: 'event', mapper: (value) => String(value) },
            {
                row: 7,
                col: 2,
                key: 'halls',
                header: [
                    {
                        text: 'Hallen',
                        row: 7,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 8,
                col: 2,
                key: 'traffics',
                header: [
                    {
                        text: 'Verkehrsflächen',
                        row: 8,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 9,
                col: 2,
                key: 'sanitary',
                header: [
                    {
                        text: 'Sanitärflächen',
                        row: 9,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 10,
                col: 2,
                key: 'toiletService',
                header: [
                    {
                        text: 'WC Besetzung',
                        row: 10,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 11,
                col: 2,
                key: 'outdoor',
                header: [
                    {
                        text: 'Aussengelände',
                        row: 11,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 12,
                col: 2,
                key: 'additionalService',
                header: [
                    {
                        text: 'diverse Zusatzarbeiten',
                        row: 12,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 13,
                col: 2,
                key: 'adjoining-rooms',
                header: [
                    {
                        text: 'Nebenräume MG',
                        row: 13,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 14,
                col: 2,
                key: 'ideal-areas',
                header: [
                    {
                        text: 'Ideelle Flächen',
                        row: 14,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 15,
                col: 2,
                key: 'drk-station',
                header: [
                    {
                        text: 'DRK-Stationen',
                        row: 15,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 16,
                col: 2,
                key: 'cash-desk',
                header: [
                    {
                        text: 'Kassen',
                        row: 16,
                        col: 1
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                row: 17,
                col: 2,
                key: 'additionally',
                header: [{ text: 'Zusatzarbeiten aus Hallenrücknahme', row: 17, col: 1 }],
                mapper: (value) => Number(value)
            }
        ]
    },
    halls: {
        worksheet: 'Hallen',
        type: 'list',
        rowOffset: 14,
        columns: [
            {
                index: 1,
                key: 'name',
                header: [
                    {
                        text: 'Halle',
                        row: 13,
                        col: 1
                    }
                ],
                mapper: (value) => String(value)
            },
            {
                index: 2,
                key: 'area',
                header: [
                    {
                        text: 'Fläche',
                        row: 13,
                        col: 2
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 3,
                key: 'areaRate',
                header: [
                    {
                        text: 'Flächen-anteil',
                        row: 13,
                        col: 3
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 4,
                key: 'setupCleaning',
                header: [{ text: 'VR Aufbau', row: 13, col: 4 }],
                mapper: (value) => Number(value)
            },
            {
                index: 5,
                key: 'preCleaning',
                header: [
                    { text: 'finale', row: 12, col: 5 },
                    { text: 'Vor- reinig.', row: 13, col: 5 }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 6,
                key: 'nightlyCleaning40%',
                header: [
                    {
                        text: '0.4',
                        row: 12,
                        col: 6
                    },
                    {
                        text: 'lfd. VR Nacht',
                        row: 13,
                        col: 6
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 7,
                key: 'nightlyCleaning',
                header: [
                    {
                        text: '1',
                        row: 12,
                        col: 7
                    },
                    {
                        text: 'lfd. VR Nacht',
                        row: 13,
                        col: 7
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 8,
                key: 'dailyCleaning40%',
                header: [
                    {
                        text: '0.4',
                        row: 12,
                        col: 8
                    },
                    {
                        text: 'lfd. Tag',
                        row: 13,
                        col: 8
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 9,
                key: 'dailyCleaning',
                header: [
                    {
                        text: '1',
                        row: 12,
                        col: 9
                    },
                    {
                        text: 'lfd. Tag',
                        row: 13,
                        col: 9
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 10,
                key: 'postCleaning',
                header: [
                    {
                        text: 'Nach-reinig.',
                        row: 13,
                        col: 10
                    }
                ],
                mapper: (value) => Number(value)
            }
        ]
    },
    traffics: {
        worksheet: 'Verkehr',
        type: 'list',
        rowOffset: 11,
        columns: [
            {
                index: 1,
                key: 'name',
                header: [
                    {
                        text: 'Fläche',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 2,
                key: 'details',
                header: [
                    {
                        text: 'Details/\nOrtsangabe',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 3,
                key: 'floor',
                header: [
                    {
                        text: 'Ebene',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 4,
                key: 'area',
                header: [
                    {
                        text: 'Fläche',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 5,
                key: 'dayCount',
                header: [
                    {
                        text: 'Tage',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 6,
                key: 'preCleaning',
                header: [
                    {
                        text: 'Vor-reinig.',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 7,
                key: 'nightlyCleaning',
                header: [
                    {
                        text: 'lfd. VR Nacht',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 8,
                key: 'dailyCleaning',
                header: [
                    {
                        text: 'lfd. Tag',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 9,
                key: 'postCleaning',
                header: [
                    {
                        text: 'NR',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            }
        ]
    },
    sanitary: {
        worksheet: 'Sanitär',
        type: 'list',
        rowOffset: 14,
        columns: [
            {
                index: 1,
                key: 'name',
                header: [
                    {
                        text: 'Foyer',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 2,
                key: 'details',
                header: [
                    {
                        text: 'Details/\nOrtsangabe',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 3,
                key: 'floor',
                header: [
                    {
                        text: 'Ebene',
                        row: 0,
                        col: 0
                    }
                ]
            },
            {
                index: 4,
                key: 'area',
                header: [
                    {
                        text: 'Fläche',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 5,
                key: 'ladycare',
                header: [
                    {
                        text: 'Ladycare-\nbehälter',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 6,
                key: 'setupCleaning',
                header: [
                    {
                        text: 'Aufbau',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 7,
                key: 'preCleaning',
                header: [
                    {
                        text: 'Vor-reinig.',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 8,
                key: 'nightlyCleaning',
                header: [
                    {
                        text: 'lfd. VR Nacht',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 9,
                key: 'dismantling',
                header: [
                    {
                        text: 'Abbau',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            },
            {
                index: 10,
                key: 'postCleaning',
                header: [
                    {
                        text: 'Nach- reinig.',
                        row: 0,
                        col: 0
                    }
                ],
                mapper: (value) => Number(value)
            }
        ]
    }
}

module.exports = billConfig
