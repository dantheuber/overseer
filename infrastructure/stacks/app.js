const { Stack } = require('@aws-cdk/core');
const { Sqs } = require('../constructs/sqs.js');
const { Sns } = require('../constructs/sns.js');
const { Database } = require('../constructs/dynamo.js');
const { DashboardBucket } = require('../constructs/bucket');
const { ScheduledLambda, LambdaRole, OverseerLambda } = require('../constructs/lambda.js');
const { RestApi } = require('../constructs/api.js');

class App extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { env } = props;

    const sqs = new Sqs(this, 'sqs-queue', { env });
    const monitorQueue = sqs.getMonitorQueue();
    const sns = new Sns(this, 'sns-topic', { env });
    const topic = sns.getTopic();

    this.bucket = new DashboardBucket(this, 'overseer-bucket');
    const tableName = 'overseen-sites';

    const database = new Database(this, 'overseer-db', { tableName, env });
    const table = database.getTable();

    const lambdaRole = new LambdaRole(this, 'role', {
      env,
      table,
      monitorQueue,
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
        TOPIC_ARN: topic.topicArn,
      },
      source: {
        type: 'sqs',
        queue: monitorQueue
      },
      role,
      env,
    });
    checkSiteLambda.node.addDependency(monitorQueue);

    const alertDownLambda = new OverseerLambda(this, 'alert-down', {
      lambdaName: 'alert-down',
      environment: {
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
        TABLE_NAME: tableName,
      },
      source: {
        type: 'sns',
        topic,
      },
      role,
      env,
    });
    const apiCommonOpts = {
      lambdaName: 'api-routes',
      environment: { TABLE_NAME: tableName },
      role,
      env,
    };
    const getFunction = new OverseerLambda(this, 'get-function', {
      nameSuffix: '-getsites',
      handler: 'index.get',
      ...apiCommonOpts,
    }).getLambda();
    const postFunction = new OverseerLambda(this, 'post-function', {      
      nameSuffix: '-postsite',
      handler: 'index.post',
      ...apiCommonOpts,
    }).getLambda();
    const putFunction = new OverseerLambda(this, 'put-function', {
      nameSuffix: '-putsite',
      handler: 'index.put',
      ...apiCommonOpts,
    }).getLambda();
    const deleteFunction = new OverseerLambda(this, 'delete-function', {
      nameSuffix: '-deletesite',
      handler: 'index.delete',
      ...apiCommonOpts,
    }).getLambda();

    const restApi = new RestApi(this, 'rest-api', {
      bucketWebsiteUrl: this.bucket.getBucket().bucketWebsiteUrl,
      getFunction,
      postFunction,
      putFunction,
      deleteFunction,
    });
  };
  getBucketUrl() {
    return this.bucket.getBucket().bucketWebsiteUrl;
  }
}

module.exports = { App };