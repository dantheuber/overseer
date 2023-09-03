const { uuid } = require('uuidv4');
const { getDynamoClient, getXray, marshall, unmarshall } = require('./lib/util');
const { jsonResponse } = require('./lib/apig');
const { DEFAULT_NEW_SITE } = require('./constants');

const TableName = process.env.TABLE_NAME;
const ddb = getDynamoClient();
const xray = getXray();

const getOwner = event => event.requestContext.authorizer.jwt.claims.sub;

exports.getSite = async (event) => {
  const facade = xray.getSegment();
  console.log('trace-id', facade.trace_id);
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const params = {
    TableName,
    Key: {
      id: {
        S: siteId
      },
      owner: {
        S: owner
      }
    },
  };
  const result = unmarshall(await ddb.query(params).promise());
  return jsonResponse(result);
};

exports.get = async (event) => {
  const facade = xray.getSegment();
  console.log('trace-id', facade.trace_id);
  const owner = getOwner(event);
  const params = {
    TableName,
    IndexName: 'owner',
    KeyConditionExpression: '#o = :o',
    ExpressionAttributeValues: {
      ':o': { S: owner },
    },
    ExpressionAttributeNames: {
      '#o': 'owner',
    }
  };
  const Items = (await ddb.query(params).promise()).Items.map(unmarshall);
  return jsonResponse({ Items });
};

exports.post = async (event) => {
  const facade = xray.getSegment();
  console.log('trace-id', facade.trace_id);
  const owner = getOwner(event);
  const body = JSON.parse(event.body);
  const Item = marshall({
    id: uuid(),
    status: 'up',
    owner,
    ...DEFAULT_NEW_SITE,
    ...body,
  });
  const params = {
    TableName,
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(unmarshall(await ddb.putItem(params).promise().then((() => ({ ...Item })))));
};

exports.put = async (event) => {
  const facade = xray.getSegment();
  console.log('trace-id', facade.trace_id);
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const Item = marshall(JSON.parse(event.body));
  const params = {
    TableName,
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return jsonResponse(unmarshall(await ddb.putItem(params).promise().then((() => ({ ...Item })))));
};

exports.delete = async (event) => {
  const facade = xray.getSegment();
  console.log('trace-id', facade.trace_id);
  const owner = getOwner(event);
  const siteId = event.pathParameters.siteId;
  const params = {
    TableName,
    Key: {
      id: {
        S: siteId,
      },
      owner: {
        S: owner,
      }
    },
  };
  return jsonResponse(await ddb.deleteItem(params).promise());
};