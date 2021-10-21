const { alertDiscord, getDynamoClient } = require('./lib/util');

const handler = async (event) => {
  const ddb = getDynamoClient();
  for await (let item of event.Records) {
    const parsed = JSON.parse(item.Sns.Message);
    let status;
    let alerted = true;
    const alertedTime = Date.now();
    if (parsed.results.status < 500) {
      await alertDiscord(`:partying_face: ${parsed.site.url} is back up after going down at \`${Date(parsed.site.downTime)}\``);
      alerted = false;
      status = 'up';
    } else {
      await alertDiscord(`:fire: ${parsed.site.url} is DOWN! Status: ${parsed.results.status}`);
      status = 'down';
    }

    await ddb.update({
      TableName: process.env.TABLE_NAME,
      Key: { url: parsed.site.url },
      UpdateExpression: 'set #status = :st, #alerted = :alt, #alertedTime = :altTime',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#alerted': 'alerted',
        '#alertedTime': 'alertedTime',
      },
      ExpressionAttributeValues: {
        ':st': status,
        ':alt': alerted,
        ':altTime': alertedTime,
      },
      ReturnValue: 'UPDATED_NEW',
    }).promise();
  }
};

module.exports = {
  handler,
};
