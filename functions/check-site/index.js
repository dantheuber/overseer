const fetch = require('node-fetch');
const {
  getSns,
  getDynamoClient,
  shouldAlert,
} = require('./lib/util');

const handler = async (event) => {
  const sns = getSns();
  const ddb = getDynamoClient();
  for await (let item of event.Records) {
    let results;
    const site = JSON.parse(item.body);
    try {
      results = await fetch(site.url);
    } catch (e) {
      console.log(`error fetching ${site.url}`);
      console.error(e);
      results = { status: 500, error: e }
    }
    
    if (shouldAlert(results, site)) {
      await sns.publish({
        TopicArn: process.env.TOPIC_ARN,
        Message: JSON.stringify({
          site,
          results: {
            ...results,
            status: results.status,
          }
        }),
        MessageAttributes: {
          SiteStatus: {
            DataType: 'String',
            StringValue: results.status < 500 ?  'up':'down',
          },
          SiteUrl: {
            DataType: 'String',
            StringValue: site.url
          }
        },
      }).promise();
    }

    if (!site.alerted && results.status >= 500) {
      return await ddb.update({
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

    // if its a new site with no status and it is up, we should set it as such
    if (!site.status) {
      return await ddb.update({
        TableName: process.env.TABLE_NAME,
        Key: { url: site.url },
        UpdateExpression: 'set #st = :st',
        ExpressionAttributeNames: {
          '#st': 'status',
        },
        ExpressionAttributeValues: {
          ':st': 'up',
        },
      }).promise();
    }
  }
};

module.exports = {
  handler,
};
