const fetch = require('node-fetch');
const AWSXray = require('aws-xray-sdk');
// capture AWS SDK calls
const AWS = AWSXray.captureAWS(require('aws-sdk'));

AWSXray.enableAutomaticMode();

const handleMissingContextStrategy = (...props) => {
  console.log('Context missing strategy');
  console.log(props);
};

AWSXray.setContextMissingStrategy(handleMissingContextStrategy);

const getXray = () => AWSXray;

let ddb;
const getDynamoClient = () => {
  if (!ddb) {
    ddb = new AWS.DynamoDB.DocumentClient();
  }
  return ddb;
};

let sqs;
const getSqs = () => {
  if (!sqs) {
    sqs = new AWS.SQS();
  }
  return sqs;
};

let sns;
const getSns = () => {
  if (!sns) {
    sns = new AWS.SNS();
  }
  return sns;
};

const pluralTime = t => t > 1 ? 's': '';
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  let time = Math.floor(interval);
  if (interval > 1) {
    return `${time} year${pluralTime(time)}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    time = Math.floor(interval);
    return `${time} month${pluralTime(time)}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    time = Math.floor(interval);
    return `${time} day${pluralTime(time)}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    time = Math.floor(interval);
    return `${time} hour${pluralTime(time)}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    time = Math.floor(interval);
    return `${time} minute${pluralTime(time)}`;
  }
  time = Math.floor(interval);
  return `${time} second${pluralTime(time)}`;
};

const minAgo = (min = 10) => {
  const now = new Date();
  return new Date(now.getTime() - min*60000).getTime();
};

const shouldAlert = (results, site) =>
  (results.status >= 500 && (!site.alerted || site.alertedTime <= minAgo(site.minBetweenAlerts)))
  || (site.status === 'down' && results.status < 500);

const alertDiscord = async (content, site, color) => await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'Overseer',
    avatar_url: `https://${process.env.DASHBOARD_DOMAIN}/overseer.jpg`,
    content,
    embeds: [{
      title: site.label,
      url: site.url,
      description: site.description,
      color,
      fields: [{
        name: 'Downtime',
        value: timeSince(site.downTime),
        inline: true,
      }],
    }],
  }),
});

module.exports = {
  shouldAlert,
  alertDiscord,
  getDynamoClient,
  getSqs,
  getSns,
  getXray,
  timeSince,
};
