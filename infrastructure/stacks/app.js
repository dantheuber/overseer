const { Stack } = require('@aws-cdk/core');
const { Sqs } = require('../constructs/sqs.js');
const { Sns } = require('../constructs/sns.js');
const { Database } = require('../constructs/dynamo.js');
const { ScheduledLambda, LambdaRole, OverseerLambda } = require('../constructs/lambda.js');

class App extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { env } = props;

    const sqs = new Sqs(this, 'sqs-queue', { env });
    const monitorQueue = sqs.getMonitorQueue();
    const alertQueue = sqs.getAlertQueue();
    const sns = new Sns(this, 'sns-topic', { env });
    const topic = sns.getTopic();

    const tableName = 'overseen-sites';

    const database = new Database(this, 'overseer-db', { tableName, env });
    const table = database.getTable();

    const lambdaRole = new LambdaRole(this, 'role', {
      env,
      table,
      monitorQueue,
      alertQueue,
      topic,
    });
    
    const role = lambdaRole.getRole();
    
    const scheduledLambda = new ScheduledLambda(this, 'queue-pop', {
      lambdaName: 'populate-checkup-queue',
      rate: '1 minute',
      environment: {
        TABLE_NAME: tableName,
        QUEUE_URL: monitorQueue.queueUrl
      },
      env,
      role,
    });
    scheduledLambda.node.addDependency(table);
    scheduledLambda.node.addDependency(monitorQueue);

    const checkSiteLambda = new OverseerLambda(this, 'check-site', {
      lambdaName: 'check-site',
      environment: {
        TABLE_NAME: tableName,
        QUEUE_URL: alertQueue.queueUrl,
      },
      source: monitorQueue,
      role,
      env,
    });
    checkSiteLambda.node.addDependency(monitorQueue);
    checkSiteLambda.node.addDependency(alertQueue);

    const alertDownLambda = new OverseerLambda(this, 'alert-down', {
      lambdaName: 'alert-down',
      environment: {
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
        TABLE_NAME: tableName,
      },
      source: alertQueue,
      role,
      env,
    });
    alertDownLambda.node.addDependency(alertQueue);
  };
}

module.exports = { App };