const fetch = require('node-fetch');
const {
  getXray,
  getSns,
  getDynamoClient,
  shouldAlert,
  marshall,
} = require('./lib/util');

const handler = async (event, context) => {
  const sns = getSns();
  const ddb = getDynamoClient();

  const facade = getXray().getSegment();
  facade.addMetadata('records-processed', event.Records.length);
  let num_alerted = 0;
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
    
    const _shouldAlert = shouldAlert(results, site);

    if (_shouldAlert) {
      num_alerted = num_alerted + 1;
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
      const Item = marshall({
        ...site,
        downTime: Date.now(),
      });
      return await ddb.putItem({
        TableName: process.env.TABLE_NAME,
        Item,
        ReturnValue: 'UPDATED_NEW',
      }).promise();
    }

    // if its a new site with no status and it is up, we should set it as such
    if (!site.status) {
      const Item = marshall({
        ...site,
        status: 'up',
      })
      return await ddb.putItem({
        TableName: process.env.TABLE_NAME,
        Item,
        ReturnValue: 'UPDATED_NEW',
      }).promise();
    }
    facade.addMetadata('sites-alerted', num_alerted);
  }
  facade.close();
};

module.exports = {
  handler,
};
