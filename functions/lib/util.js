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

module.exports = {
  getDynamoClient,
  getSqs,
};
