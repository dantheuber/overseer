const {
  alertDiscord,
  getDynamoClient,
  timeSince,
  marshall,
} = require('./lib/util');

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
    const Item = marshall({
      ...parsed.site,
      status,
      alerted,
      alertedTime,
    });
    await ddb.putItem({
      TableName: process.env.TABLE_NAME,
      Item,
      ReturnValues: 'ALL_OLD'
    }).promise();
  }
};

module.exports = {
  handler,
};
