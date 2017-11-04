/*
 * tenkey.js
 */
'use strict';

function assertString(str) {
    const assert = require('assert');
    assert(typeof str === 'string', `文字列ではありません:${typeof str}, ${str}`);
}

function assertInstanceOf(obj, clazz) {
    const assert = require('assert');
    assert(obj instanceof clazz, 'クラスの型が不正です');
}


const readline = require('readline');
const stdIO = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function readLine(readlineInterface) {
    assertInstanceOf(readlineInterface, readline.Interface);
    return new Promise((resolve) => {
            readlineInterface.on('line', (line) => {
                    assertString(line);
                    return resolve(line);
                    });
            readlineInterface.on('close', () => {
                    return resolve(null);
                    });
            });
}

function updateDB(input) {
    //入力はID入力してその後、入(+)退(-)外(*)のどれかが入力
    if(true !== /^[0-9]{6}[\+\-\*]{1}$/.test(input)) {
        console.log('IDは数字の6桁と状態(+,-,*)を入力してください');
        return;
    }
    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    const url = 'mongodb://localhost:27017/test';
    MongoClient.connect(url).then((db) => {
        updateDocument(db, input).then(() => {
            db.close();
        });
    });

    function updateDocument(db, input) {
        const operator = input.slice(6);
        const id = input.slice(0,6);
        const collection = db.collection('test');
        return collection.findOne({_id : id }).then((doc) => {
            const STATE = [
                { state : 'IN', operator : '+' },
                { state : 'OUT', operator : '-' },
                { state : 'BREAK_TIME', operator : '*' }
            ];
            for(let i in STATE) {
                if(STATE[i].operator === operator) {
                    console.log(`${id} : ${STATE[i].state}`);        
                    return collection.updateOne({ _id : id }, { $set: { lab_in : STATE[i].state } });
                }
            }
        }).then((result) => {
            return result.modifiedCount === 1 ? Promise.resolve() : Promise.reject();
        }).catch((e) => {
            console.log('IDが見つかりません');
            console.log(e);
        });
    }
}

(function loop() {
 readLine(stdIO).then((line) => {
         updateDB(line);
         loop();
         }).catch((e) => {
             console.log(`エラー:${e}`);
             }); 
 })();



