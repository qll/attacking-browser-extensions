var db = openDatabase('extdb', '1.0', 'extension database', 2 * 1024 * 1024);

db.transaction(function(tx) {
    tx.executeSql('SELECT 1, 2', [], (tx, results) => {
        var len = results.rows.length;
        for (i = 0; i < len; i++) {
            console.log(results.rows.item(i));
        }
    }, (tx, error) => {
        console.error(error.message)
    });
});
