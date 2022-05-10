require("dotenv").config();
const { Client } = require("pg");
const dbClient = new Client();
dbClient.connect();


var buildSchema = async () => {
    console.log("[DB] BUILDING SCHEMA");
    await cleanDb();
    await rss();
    await message();
};

var cleanDb = () => {
    dbClient.query(
        `
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO govpostadmin;
        GRANT ALL ON SCHEMA public TO public;
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `,
        (err, res) => {
            if (err) {
                console.log("[SCHEMA] Schema RESET. " + err);
                return false;
            } else {
                console.log("[SCHEMA] Schema RESET. ");
                return true;
            }
        }
    );
};

var message = () => {
    dbClient.query(
        `
      CREATE TABLE public.message (
            id SERIAL PRIMARY KEY,
            guid text unique NOT NULL,

            title text NOT NULL,
            link text NOT NULL,
            content text NOT NULL,

            category text,
            tokens TSVECTOR NOT NULL,
            created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL, 
            rss_id int not null,

            CONSTRAINT fk_rss_id
            FOREIGN KEY(rss_id) 
                REFERENCES rss(id)
                    ON DELETE CASCADE
        );
      `,
        (err, res) => {
            if (err) {
                console.log("[TABLE]  BUILD FAILED. " + err);
                return false;
            } else {
                console.log("[TABLE] BUILT. ");
                return true;
            }
        }
    );
};

var rss = () => {
    dbClient.query(
        `
      CREATE TABLE public.rss (
            id SERIAL PRIMARY KEY,
  
            url text UNIQUE NOT NULL,
            title text NOT NULL,

            created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `,
        (err, res) => {
            if (err) {
                console.log("[TABLE] rss BUILD FAILED. " + err);
                return false;
            } else {
                console.log("[TABLE] rss BUILT. ");
                return true;
            }
        }
    );
};

buildSchema();


