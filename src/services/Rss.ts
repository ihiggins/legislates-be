import { FastifyApp } from "../types/common";
import Parser from 'rss-parser'
import json from '../../rssList.json';
import { checkDuplicate, getRss, bulkMessageInsert, insertMessage } from './Postgres';
import { spawn } from 'child_process';
import path from 'path';
import cron from 'node-cron'

let parser = new Parser();

const parseUrl = async (url: string) => {
    let feed = await parser.parseURL(url);
    var temp = JSON.stringify(feed)
    var temp2 = temp.replace("'", '’');
    var temp3 = JSON.parse(temp2)
    var res = [];
    for (var i in temp3.items) {
        res.push({
            title: temp3.items[i].title,
            link: temp3.items[i].link,
            guid: temp3.items[i].guid,
            content: temp3.items[i].content,
        })
    }
    return res;
}

const reSync = async (url: string, generate: boolean) => {
    const rss = await getRss(url);
    const items = await parseUrl(url)
    if (generate) {
        await generateContent(items)
    }
    for (var i in items) {
        await insertMessage(items[i], rss.id)
    }
}

const generateContent = async (items: any) => {
    for (var i in items) {
        var inDb = await checkDuplicate(items[i].guid)
        if (!inDb) {
            var contentSummery = await runPy(path.join(__dirname, '..', 'lib', 'py', 'nlp.py'), items[i].url + '.htm');
            if (contentSummery) {
                items[i].content = contentSummery
            }
        }
    }

    return items

};

const runPy = (path: string, args: string) => {
    return new Promise(function (success, reject) {
        try {
            const pyArgs = [path, JSON.stringify(args)]
            const pyprog = spawn('python', [path, args]);

            let result = "";
            let resultError = "";
            pyprog.stdout.on('data', function (data: any) {
                result += data.toString();
            });
            pyprog.stderr.on('data', (data: any) => {
                resultError += cleanWarning(data.toString());
            });
            pyprog.stdout.on("end", function () {
                success(result);
            })
        } catch (e) {
            reject(false);

        }
    });
}

const cleanWarning = (error: any) => {
    return error.replace(`/Detector is not able to detect the language reliably.\n/g`, "");
}

export const initRss = async (app: FastifyApp, version: string) => {
    app.log.info('Initialized Rss Service')
    /**
     * Cron job fetches rss feeds
     * runs every hour?
     */
    cron.schedule('0 * * * *', () => {
        app.log.info('UPDATING RSS FEEDS')
        for (var i in json.records) {
            for (var i in json.records) {
                reSync(json.records[i].url, json.records[i].generate)
            }
        }
    });
}