import { FastifyApp } from "../types/common";
import { Client } from 'pg'
require("dotenv").config();

const dbClient = new Client();

export const initPostgres = (app: FastifyApp, version: string) => {
    dbClient.connect();
    app.log.info(`Postgres Connected`);
}

export const getRss = async (url: string) => {
    return dbClient
        .query(
            `
        select * from rss
        where url = '${url}'
          `
        )
        .then((res: any) => {
            return res.rows[0];
        })
        .catch((e: any) => {
            return false;
        });
};

export const bulkMessageInsert = (data: any, rss_id: any) => {
    var packed = '';
    for (var i in data) {
        const pack = `('${data[i].guid}','${data[i].title}','${data[i].link}','${data[i].content}','${data[i].categories}','${rss_id}','${data[i].title}')`;
        packed += pack + ",";
    }

    packed = packed.slice(0, -1)

    return dbClient
        .query(
            `
      insert into message
      (guid,title,link,content,category,rss_id,tokens)
      values
      ${packed}
      ON CONFLICT DO NOTHING
        `
        )
        .then((res: any) => {
            return res.rows;
        })
        .catch((e: any) => {
            console.log(`(bulkMessageInsert) ${e} , ${packed}`);
            return false;
        });
};

export const checkDuplicate = async (guid: string) => {
    return dbClient
        .query(
            `
        select * from message
        where guid = '${guid}'
          `
        )
        .then((res: any) => {
            if (res.rows[0]) return true;
            else return false;
        })
        .catch((e: any) => {
            console.log(e, 'error');
            return false;
        });
};

export const insertMessage = async (data: any, rss_id: number) => {
    return dbClient
        .query(
            `
      insert into message
      (guid,title,link,content,category,rss_id,tokens)
      values
      ('${data.guid}','${data.title}','${data.link}','${data.content}','${data.categories}','${rss_id}',to_tsvector('${data.title}'))
        `
        )
        .then((res: any) => {
            return res.rows;
        })
        .catch((e: any) => {
            console.log(`(insertMessage) ${e}`);
            return false;
        });
};

export const getMessages = async (rss_id: number) => {
    return dbClient
        .query(
            `
            select
            *
          from
            message
          where
            rss_id = ${rss_id}
            and created_at >= NOW() - INTERVAL '24 HOURS'
          order by
            created_at
        `
        )
        .then((res: any) => {
            return res.rows;
        })
        .catch((e: any) => {
            console.log(`(insertMessage) ${e}`);
            return false;
        });
};

export const search = async (query: string) => {
    return dbClient
        .query(
            `
            select * from message
            where to_tsvector(message.title) @@ to_tsquery('${query}')
            limit 6
          `
        )
        .then((res) => {
            return res.rows;
        })
        .catch((e) => {
            console.log(`(search) error ${query}`);
            return false;
        });
};


export { dbClient };


