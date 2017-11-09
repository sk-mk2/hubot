const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/test';
const assert = require('assert');
const collectionName = 'test';

module.exports = (hubot) => {
    hubot.hear(/[0-9]{6}[\+\-\*]{1}/i, (res) => {
        const input = res.match[0];
        MongoClient.connect(dbUrl).then((db) => {
            updateDocument(db, input).then(() => {
                db.close();
            });
        });

        function updateDocument(db, input) {
            const operator = input.slice(6);
            const id = input.slice(0,6);
            const collection = db.collection('test');
            return collection.findOne({_id : id}).then((doc) => {
                const STATE = [
                    { state : 'IN', operator : '+'},
                    { state : 'OUT', operator : '-'},
                    { state : 'BREAK_TIME', operator : '*'},
                ];
                for(let i in STATE) {
                    if(STATE[i].operator === operator) {
                        res.send(STATE[i].state);
                        return collection.updateOne({ _id : id},{ $set : { lab_in :STATE[i].state } });
                    }
                }
            }).then((result) => {
                return result.modifiedCount === 1 ? Promise.resolve() : Promise.reject();
            }).catch((e) => {
                res.send('IDが見つからない、またはすでに入力された状態です');
            });
        }
    
    });
}
