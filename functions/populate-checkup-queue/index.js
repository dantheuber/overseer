const {
  getDynamoClient,
  getSqs,
  getXray,
  unmarshall,
} = require('./lib/util');


const handler = async (event, context) => {
  console.log(event);
  console.log(context);
  const xray = getXray();
  const segment = xray.getSegment();

  const sqs = getSqs();
  const ddb = getDynamoClient();
  const params = { TableName: process.env.TABLE_NAME };
  let items;
  do {
    items = await ddb.scan(params).promise();
    await Promise.all(items.Items.map(async (item) => {
      const site = unmarshall(item);
      console.log(site, item);
      const subsegment = segment.addNewSubsegment(site.id);
      subsegment.addAnnotation('site', site.url);
      const result = await sqs.sendMessage({
        MessageBody: JSON.stringify(site),
        QueueUrl: process.env.QUEUE_URL,
        MessageAttributes: {
          'xray-trace-id': {
            StringValue: segment.trace_id,
            DataType: 'String',
          }
        }
      }).promise()
      subsegment.close();
      return result;
    }
    ));
  } while (typeof items.LastEvaluatedKey !== 'undefined');
  segment.close();
};

module.exports = { handler };
