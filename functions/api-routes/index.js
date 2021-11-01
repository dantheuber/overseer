const { getDynamoClient } = require('./lib/util');

const TableName = process.env.TABLE_NAME;
const ddb = getDynamoClient();

const formatReturn = (val, statusCode = 200) => ({
  body: JSON.stringify(val, null, 2),
  statusCode,
});

exports.get = async () => {
  const params = { TableName };
  return formatReturn(await ddb.scan(params).promise());
};

const put = async (event) => {
  const Item = JSON.parse(event.body);
  const params = {
    TableName,
    Item,
    ReturnValues: 'ALL_OLD',
  };
  return formatReturn(await ddb.put(params).promise());
};

exports.post = put;
exports.put = put;

exports.delete = async (event) => {
  const { url } = JSON.parse(event.body);
  const params = {
    TableName,
    Key: { url }
  };
  return formatReturn(await ddb.delete(params).promise());
};
