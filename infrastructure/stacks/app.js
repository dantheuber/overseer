import { Stack } from '@aws-cdk/core';
import { Queue } from '../constructs/sqs';
import { Topic } from '../constructs/sns';
import { Database } from '../constructs/dynamo';
import { ScheduledLambda, LambdaRole, OverseerLambda } from '../constructs/lambdas';
import { OverseerLambda } from '../constructs/lambda';

export class App extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { env } = props;

    const sqs = new Queue(this, 'sqs-queue', { env });
    const monitorQueue = sqs.getMonitorQueue();
    const alertQueue = sqs.getAlertQueue();
    const sns = new Topic(this, 'sns-topic', { env });
    const topic = sns.getTopic();

    const tableName = 'overseen-sites';

    const database = new Database(scope, 'overseer-db', { tableName, env });
    const table = database.getTable();

    const lambdaRole = new LambdaRole(this, 'role', {
      env,
      table,
      monitorQueue,
      alertQueue,
      topic,
    });
    lambdaRole.addDependsOn(database);
    lambdaRole.addDependsOn(sqs);
    lambdaRole.addDependsOn(sns);
    
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
    scheduledLambda.addDependsOn(table);
    scheduledLambda.addDependsOn(monitorQueue);

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
    checkSiteLambda.addDependsOn(alertQueue);

    const alertDownLambda = new OverseerLambda(this, 'alert-down', {
      lambdaName: 'alert-down',
      environment: {
        TABLE_NAME: tableName,
      },
      source: alertQueue,
      role,
      env,
    });
  };
}