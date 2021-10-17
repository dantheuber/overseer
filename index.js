import mongoose from 'mongoose';
import fetch from 'node-fetch';
import {
  SITE_CHECK_INTERVAL,
  DEV_HOOK_URL,
  MONGO_URL
} from './constants.js';

const Site = mongoose.model('Site', new mongoose.Schema({
  url: String,
  online: {
    type: Boolean,
    default: true,
  },
  alerted: {
    type: Boolean,
    default: false,
  }
}));

const handleCheck = async (site) => {
  site.results = await fetch(site.url);
  return site;
};

let interval = null;
(async () => {
  await mongoose.connect(MONGO_URL);
  console.log('connected');
  interval = setInterval(async () => {
    console.log('Beginning site checks');
    console.time('Overall Duration');
    const sites = await Site.find({});
    console.time('Make Requests')
    const results = await Promise.all(sites.map(handleCheck));
    console.timeEnd('Make Requests');

    for (var result of results) {
      if (result.results.status !== 200) {
        console.log(`${result.url} is DOWN! Returned code: ${result.results.status}`);
        await alertDiscord(`${result.url} is DOWN! Returned code: ${result.results.status}`)
      } else {
        console.log(`${result.url} OK`);
        await alertDiscord(`${result.url} OK`);
      }
    }
    console.timeEnd('Overall Duration');
  }, SITE_CHECK_INTERVAL);
})();

const alertDiscord = async (content = `Testing :one: :two: :three:`) => await fetch(DEV_HOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content
  }),
});

