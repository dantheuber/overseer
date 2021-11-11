const { alertDiscord, getDynamoClient, timeSince } = require('./lib/util');

const handler = async (event) => {
  const ddb = getDynamoClient();
  for await (let item of event.Records) {
    const parsed = JSON.parse(item.Sns.Message);
    const status = item.Sns.MessageAttributes.SiteStatus.Value;
    let alerted = true;
    const alertedTime = Date.now();

    if (parsed.site.alertDiscord) {
      if (status === 'up') {
        await alertDiscord(
          `:partying_face: ${parsed.site.label} is back up!`,
          parsed.site,
          4506653
        );
        alerted = false;
      } else {
        await alertDiscord(
          `:fire: :fire: :fire: ${parsed.site.label} is DOWN! Status: \`${parsed.results.status}\``,
          parsed.site,
          15409955
        );
      }
    }

    await ddb.update({
      TableName: process.env.TABLE_NAME,
      Key: { id: parsed.site.id },
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
