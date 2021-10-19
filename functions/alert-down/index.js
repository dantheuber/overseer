const { alertDiscord } = require('./lib/util');

const handler = async (event) => {
  for await (let item of event.Records) {
    const parsed = JSON.parse(item.body);
    await alertDiscord(`:fire: ${parsed.url} is DOWN! Status: ${parsed.status}`);
  }
};

module.exports = {
  handler,
};
