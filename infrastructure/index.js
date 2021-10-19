import AWS from 'aws-sdk';
import cdk from '@aws-cdk/core';

const region = process.env.AWS_REGION || 'us-west-1';

AWS.config.update({ region });

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
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});