import AWS from 'aws-sdk';

let ddb;
export const getDynamoClient = () => {
  if (!ddb) {
    ddb = new AWS.DynamoDB.DocumentClient();
  }
  return ddb;
};

let sqs;
export const getSqs = () => {
  if (!sqs) {
    sqs = new AWS.SQS();
  }
  return sqs;
};