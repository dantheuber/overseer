const fetch = require('node-fetch');
const {
  getSqs,
  getDynamoClient,
  shouldAlert,
} = require('./lib/util');

const handler = async (event) => {
  const sqs = getSqs();
  const ddb = getDynamoClient();
  for await (let item of event.Records) {
    let results;
    const site = JSON.parse(item.body);
    try {
      results = await fetch(site.url);
    } catch (e) {
      results = { status: 500, error: e }
    }
    
    if (shouldAlert(results, site)) {
      await sqs.sendMessage({
        MessageBody: JSON.stringify({
          site,
          results: { ...results, status: results.status },
        }),
        QueueUrl: process.env.QUEUE_URL,
      }).promise();
    }

    if (!site.alerted && results.status !== 200) {
      await ddb.update({
        TableName: process.env.TABLE_NAME,
        Key: { url: site.url },
        UpdateExpression: 'set #downTime = :dt',
        ExpressionAttributeNames: {
          '#downTime': 'downTime'
        },
        ExpressionAttributeValues: {
          ':dt': Date.now(),
        },
        ReturnValue: 'UPDATED_NEW',
      }).promise();
    }
  }
};

module.exports = {
  handler,
};
