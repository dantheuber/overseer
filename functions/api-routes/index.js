const { uuid } = require('uuidv4');
const { getDynamoClient } = require('./lib/util');
const { unprocessableResponse, jsonResponse } = require('./lib/apig');
const { DEFAULT_NEW_SITE } = require('./constants');

const TableName = process.env.TABLE_NAME;
const ddb = getDynamoClient();

exports.getSite = async (event) => {
  console.log(event);
  if (!event.queryStringParameters.url) {
    return unprocessableResponse({ msg: 'Must provide URL' });
  }
  const params = {
    TableName,
    Key: { url: event.queryStringParameters.url }
  };
  return jsonResponse(await ddb.query(params).promise());
};

exports.get = async () => {
  const params = { TableName };
  return jsonResponse(await ddb.scan(params).promise());
};

exports.post = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body);
  const Item = {
    id: uuid(),
    ...DEFAULT_NEW_SITE,
    ...body,
  };
  console.log(Item);
  const params = {
    TableName,
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(await ddb.put(params).promise().then((() => ({ ...Item }))));
};

exports.put = async (event) => {
  const siteId = event.pathParameters.siteId;
  const Item = JSON.parse(event.body);
  const params = {
    TableName,
    Key: { id: siteId },
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(await ddb.put(params).promise().then((() => ({ ...Item }))));
};

exports.delete = async (event) => {
  const siteId = event.pathParameters.siteId;
  if (!siteId) {
    return unprocessableResponse({ msg: 'Must provide siteID' });
  }
  const params = {
    TableName,
    Key: { id: siteId },
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