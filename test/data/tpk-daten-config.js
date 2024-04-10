const tpkDatenConfig = {
    worksheet: 'Tabelle1',
    type: 'list',
    rowOffset: 15,
    columns: [
        { index: 7, key: 'internal-build-up', mapper: Date },
        { index: 8, key: 'external-build-up' },
        { index: 9, key: 'event-from' },
        { index: 10, key: 'event-to' },
        { index: 11, key: 'external-dismantling' },
        { index: 12, key: 'internal-dismantling' },
        { index: 13, key: 'matchcode' },
        { index: 14, key: 'title' },
        { index: 15, key: 'comment' },
        { index: 16, key: 'account' },
        { index: 17, key: 'type' },
        { index: 18, key: 'status' },
        { index: 19, key: 'location' },
        { index: 20, key: 'manager' },
        { index: 21, key: 'technician' },
        { index: 22, key: 'tpl' },
        { index: 23, key: 'plm' },
        { index: 24, key: 'security' },
        { index: 25, key: '2nd-manager' },
        { index: 26, key: '2nd-tpl' },
        { index: 27, key: '2nd-technician' },
        { index: 28, key: '2nd-plm' },
        { index: 29, key: '2nd-security' }
    ],
    columnHeaders: [
        ['Mantelzeit ab', 'Aufbau ab', 'VA ab', 'VA bis', 'Abbau bis', 'Mantelzeit bis', 'Veranstaltung', 'Titel', 'Änderungstext', 'Kont.', 'Typ Veranstaltung', 'Status VR', 'ORT', 'PL', 'ESPK', 'TVM', 'PLM', 'Sicherheit', 'HVL_PL', 'HVL_ESPK', 'HVL_TVM', 'HVL_PLM', 'HVL_SI']
    ]
}

module.exports = tpkDatenConfig