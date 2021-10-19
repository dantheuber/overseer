const fetch = require('node-fetch');
const AWS = require('aws-sdk');

let ddb;
const getDynamoClient = () => {
  if (!ddb) {
    ddb = new AWS.DynamoDB.DocumentClient();
  }
  return ddb;
};

let sqs;
const getSqs = () => {
  if (!sqs) {
    sqs = new AWS.SQS();
  }
  return sqs;
};

const alertDiscord = async content => await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content
  }),
});

const minAgo = (min = 10) => {
  const now = new Date();
  return new Date(now.getTime() - min*60000).getTime();
};
const shouldAlert = (results, site) =>
  (results.status >= 500 && (!site.alerted || site.alertedTime <= minAgo(site.minBetweenAlerts)))
  || (site.status === 'down' && results.status < 500);

module.exports = {
  shouldAlert,
  alertDiscord,
  getDynamoClient,
  getSqs,
};
