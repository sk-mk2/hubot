const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/test';
const assert = require('assert');
const collectionName = 'test';

module.exports = (hubot) => {
    hubot.hear(/labnow/i, (res) => {
        MongoClient.connect(dbUrl).then((db) => {
            const collection = db.collection(collectionName);
            return collection.find({}).toArray();
        }).then((docs) => {
            let hasMember = false;
            let output = '';
            let count = 0;

            for(let i in docs) {
                switch (docs[i].lab_in) {
                    case 'IN' :
                        output += `${docs[i].name}は研究室にいます\n`;
                        hasMember = true;
                        count++;
                        break;
                    case 'OUT' :
                        break;
                    case 'BREAK_TIME' :
                        output += `${docs[i].name}は一時外出中です\n`;
                        hasMember = true;
                        count++;
                        break;
                    default :
                        break;
                }
            }
	    output = `現在${count}人研究室にいます\n` + output; 

            if(hasMember) {
                res.send(output);
            } else {
                res.send('誰も研究室にいません');
            }
        });
    });
}
