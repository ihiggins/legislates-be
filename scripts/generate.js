require("dotenv").config();

const { Client } = require("pg");
let json = require('../rssList.json');
const dbClient = new Client();
dbClient.connect();


var generate = async () => {
    for (var i in json.records) {
        insertRss(json.records[i].url, json.records[i].title)
    }
};


var insertRss = (url, title) => {
    dbClient.query(
        `
        INSERT INTO rss
        (url,title)
        VALUES
        ('${url}','${title}');
      `,
        (err, res) => {
            if (err) {
                console.log("[INSERT] FAILED. " + err);
                return false;
            } else {
                console.log("[INSERT] Passed. ");
                return true;
            }
        }
    );
};

generate();

