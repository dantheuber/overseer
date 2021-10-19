const fetch = require('node-fetch');
const { getSqs, getDynamoClient } = require('./lib/util');

const handler = async (event) => {
  const sqs = getSqs();
  const ddb = getDynamoClient();
  for await (let item of event.Records) {
    let results;
    try {
      results = await fetch(item.body);
    } catch (e) {
      results = { status: 500, error: e }
    }

    if (results.status !== 200) {
      console.log(`${item.body} is DOWN`);
      await sqs.sendMessage({
        MessageBody: JSON.stringify({
          url: item.body,
          status: results.status,
        }),
        QueueUrl: process.env.QUEUE_URL,
      }).promise();
      await ddb.update({
        TableName: process.env.TABLE_NAME,
        Key: { url: item.body },
        UpdateExpression: 'set #status = :st',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':st': 'down'
        },
        ReturnValue: 'UPDATED_NEW',
      }).promise();
    }

  }
};

module.exports = {
  handler,
};
