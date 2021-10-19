import { getDynamoClient, getSqs } from '../lib/util';

export const handler = async (event) => {
  console.log(event);
  const sqs = getSqs();
  const ddb = getDynamoClient();
  const params = { TableName: process.env.TABLE_NAME };
  const items;
  do {
    items = await ddb.scan(params).promise();
    await Promise.all(items.Items.map(async (item) => 
      sqs.sendMessage({
        MessageBody: item.url,
        QueueUrl: process.env.QUEUE_URL,
      }).promise()
    ));
  } while (typeof items.LastEvaluatedKey !== 'undefined');
  console.log('done');
}