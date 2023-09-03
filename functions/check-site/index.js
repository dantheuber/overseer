const fetch = require('node-fetch');
const {
  getSns,
  getXray,
  getDynamoClient,
  shouldAlert,
} = require('./lib/util');

const handler = async (event) => {
  console.log(event);
  const xray = getXray();
  const sns = getSns();
  const ddb = getDynamoClient();
  const facade = xray.getSegment();
  console.log(facade);
  for await (let item of event.Records) {
    let results;
    const site = JSON.parse(item.body);
    // new sub-segment for each site
    const segment = facade.addNewSubsegment(site.id);
    segment.addAnnotation('site', site.url);
    segment.addAnnotation('id', site.id);
    segment.addAnnotation('alerted', site.alerted);
    console.log('Attempting to fetch site', site.url);
    try {
      // xray timer for the fetch
      const startTime = Date.now();
      segment.addMetadata('start', startTime);
      results = await fetch(site.url);
      segment.addMetadata('end', Date.now());
      segment.addMetadata('duration', Date.now() - startTime);
      segment.addAnnotation('resultStatus', results.status);
    } catch (e) {
      console.log(`error fetching ${site.url}`);
      console.error(e);
      segment.addAnnotation('error', e.message)
      results = { status: 500, error: e }
    }
    
    const _shouldAlert = shouldAlert(results, site);
    segment.addAnnotation('shouldAlert', _shouldAlert);

    if (_shouldAlert) {
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
        Key: { id: site.id },
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
        Key: { id: site.id },
        UpdateExpression: 'set #st = :st',
        ExpressionAttributeNames: {
          '#st': 'status',
        },
        ExpressionAttributeValues: {
          ':st': 'up',
        },
      }).promise();
    }
    
    // close site sub-segment
    segment.close();
  }
};

module.exports = {
  handler,
};
