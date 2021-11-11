const { getDynamoClient, getSqs } = require('./lib/util');

const handler = async () => {
  const sqs = getSqs();
  const ddb = getDynamoClient();
  const params = { TableName: process.env.TABLE_NAME };
  let items;
  do {
    items = await ddb.scan(params).promise();
    await Promise.all(items.Items.map(async (item) => 
      await sqs.sendMessage({
        MessageBody: JSON.stringify(item),
        QueueUrl: process.env.QUEUE_URL,
      }).promise()
    ));
  } while (typeof items.LastEvaluatedKey !== 'undefined');
  console.log('done');
};

module.exports = { handler };
