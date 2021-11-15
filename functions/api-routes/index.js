const { uuid } = require('uuidv4');
const { getDynamoClient } = require('./lib/util');
const { jsonResponse } = require('./lib/apig');
const { DEFAULT_NEW_SITE } = require('./constants');

const TableName = process.env.TABLE_NAME;
const ddb = getDynamoClient();

const getOwner = event => event.requestContext.authorizer.jwt.claims.sub;

exports.getSite = async (event) => {
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const params = {
    TableName,
    Key: { id: siteId, owner },
  };
  return jsonResponse(await ddb.query(params).promise());
};

exports.get = async (event) => {
  const owner = getOwner(event);
  const params = {
    TableName,
    IndexName: 'owner',
    KeyConditionExpression: '#owner = :owner',
    ExpressionAttributeValues: {
      ':owner': owner,
    },
    ExpressionAttributeNames: {
      '#owner': 'owner',
    }
  };
  return jsonResponse(await ddb.query(params).promise());
};

exports.post = async (event) => {
  const owner = getOwner(event);
  const body = JSON.parse(event.body);
  const Item = {
    id: uuid(),
    owner,
    ...DEFAULT_NEW_SITE,
    ...body,
  };
  const params = {
    TableName,
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(await ddb.put(params).promise().then((() => ({ ...Item }))));
};

exports.put = async (event) => {
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const Item = JSON.parse(event.body);
  const params = {
    TableName,
    Key: { id: siteId, owner },
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(await ddb.put(params).promise().then((() => ({ ...Item }))));
};

exports.delete = async (event) => {
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const params = {
    TableName,
    Key: { id: siteId, owner },
  };
  return jsonResponse(await ddb.delete(params).promise());
};

exports.callback = async (event) => {
  console.log(event);
  return jsonResponse({
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
      input: event,
    }),
  });
}