import NodeCache from 'node-cache';
const queryCache = new NodeCache();
import { FastifyApp } from "../types/common";
import * as cheerio from 'cheerio';
import fetch from 'cross-fetch'

const scrapeArticles = async (html: any) => {
  const $ = cheerio.load(html);
  let results: any = [];
  let res = $('body #main').find('.xpd a').each(function (_index, element: any) {
    const temp = {
      pub: $(element).find('.UPmit').text(),
      title: $(element).find('h3').text(),
      //@ts-ignore
      url: $(element).attr('href').substring(7),
    };
    results.push(temp)
  })

  return results;
};


export const queryTopic = async (query: string) => {
  try {
    const inCache = queryCache.get(query);
    if (inCache) return inCache;
    const response = await fetch(`https://www.google.com/search?q=${query}&tbm=nws&`);
    const body = await response.text();
    const scraped = await scrapeArticles(body);
    queryCache.set(query, scraped, 600);
    return scraped;
  } catch (e) {
    console.log(e)
    return false;
  }
};


export const initNews = (app: FastifyApp, version: string) => {
  app.log.info('Initialized News Service')
}