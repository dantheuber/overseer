const AWS = require('aws-sdk');
const cdk = require('@aws-cdk/core');
const { App } = require('./stacks/app.js');
require('dotenv').config();
const region = process.env.AWS_REGION || 'us-east-1';

AWS.config.update({ region });
console.log(`Deploying to ${region}`);
async function build() {
  const sts = new AWS.STS();
  const app = new cdk.App();

  const identity = await sts.getCallerIdentity().promise();
  const env = {
    env: {
      region,
      account: identity.Account,
    }
  };

  const appStack = new App(app, 'overseer-app-stack', {
    ...env,
  });

  app.synth();
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});