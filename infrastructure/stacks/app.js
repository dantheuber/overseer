const path = require('path');
const { Stack } = require('@aws-cdk/core');
const { Code } = require('@aws-cdk/aws-lambda');
const { StringParameter } = require('@aws-cdk/aws-ssm');
const { Sqs } = require('../constructs/sqs');
const { Sns } = require('../constructs/sns');
const { Database } = require('../constructs/dynamo');
const { DashboardBucket } = require('../constructs/bucket');
const { ScheduledLambda, LambdaRole, OverseerLambda } = require('../constructs/lambda');
const { Domain } = require('../constructs/domain');
const { RestApi } = require('../constructs/api');
const { Pool } = require('../constructs/userpool');

class App extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { env } = props;

    const sqs = new Sqs(this, 'sqs-queue', { env });
    const monitorQueue = sqs.getMonitorQueue();
    const sns = new Sns(this, 'sns-topic', { env });
    const topic = sns.getTopic();

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
        DASHBOARD_DOMAIN: process.env.DASHBOARD_DOMAIN,
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
      code: Code.fromAsset(path.join(__dirname, `../../functions/api-routes`)),
      role,
      env,
    };
    const getFunction = new OverseerLambda(this, 'get-function', {
      nameSuffix: '-list-sites',
      handler: 'index.get',
      ...apiCommonOpts,
    }).getLambda();
    const getSiteFunction = new OverseerLambda(this, 'get-site-function', {
      nameSuffix: '-get-site',
      handler: 'index.getSite',
      ...apiCommonOpts,
    }).getLambda();
    const postFunction = new OverseerLambda(this, 'post-function', {      
      nameSuffix: '-post-site',
      handler: 'index.post',
      ...apiCommonOpts,
    }).getLambda();
    const putFunction = new OverseerLambda(this, 'put-function', {
      nameSuffix: '-put-site',
      handler: 'index.put',
      ...apiCommonOpts,
    }).getLambda();
    const deleteFunction = new OverseerLambda(this, 'delete-function', {
      nameSuffix: '-delete-site',
      handler: 'index.delete',
      ...apiCommonOpts,
    }).getLambda();
    // const callbackFunction = new OverseerLambda(this, 'callback-function', {
    //   nameSuffix: '-callback',
    //   handler: 'index.callback',
    //   ...apiCommonOpts,
    // }).getLambda();

    const restApi = new RestApi(this, 'rest-api', {
      getFunction,
      getSiteFunction,
      postFunction,
      putFunction,
      deleteFunction,
      // callbackFunction,
    });
    
    const ssmParam = new StringParameter(this, 'api-id', {
      stringValue: restApi.getApi().apiId,
      parameterName: '/Overseer/RestApiId',
      description: 'The APIG ID for the overseer rest api',
    });
    ssmParam.node.addDependency(restApi.getApi());
    this.bucket = new DashboardBucket(this, 'overseer-bucket', {
      api: restApi.getApi(),
      env,
    });

    this.domain = new Domain(this, 'overseer-domain', {
      cloudfrontDistribution: this.bucket.getCloudfrontDistribution(),
      bucket: this.bucket.getBucket(),
    });
    
    const pool = new Pool(this, 'user-pool', {
      env,
      topic,
    });
    pool.node.addDependency(this.domain.getDashboardRecord());
    pool.node.addDependency(this.domain.getRootRecord());
  };
  getBucketUrl() {
    return this.bucket.getBucket().bucketWebsiteUrl;
  }
}

module.exports = { App };