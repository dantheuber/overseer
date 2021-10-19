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

const alertDiscord = async (content = `Testing :one: :two: :three:`) => await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content
  }),
});


module.exports = {
  alertDiscord,
  getDynamoClient,
  getSqs,
};
