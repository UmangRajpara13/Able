import PouchDB from 'pouchdb'

var db = new PouchDB('charlie');


db.put({
    _id: 'open-window',
    execute: {
        type: "cli",
        run: "comm"
    }
}).then(function (response) {
    // handle response
}).catch(function (err) {
    console.log(err);
});



db.get('open-window').then(function (doc) {
    // handle doc
    console.log(doc)
}).catch(function (err) {
    console.log(err);
});

