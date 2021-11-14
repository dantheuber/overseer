const { Construct, Duration } = require('@aws-cdk/core');
const { Function, Code, Runtime } = require('@aws-cdk/aws-lambda');
const { LambdaSubscription } = require('@aws-cdk/aws-sns-subscriptions');
const { SqsEventSource } = require('@aws-cdk/aws-lambda-event-sources');
const { LambdaFunction } = require('@aws-cdk/aws-events-targets');
const { Rule, Schedule } = require('@aws-cdk/aws-events');
const { RetentionDays } = require('@aws-cdk/aws-logs');
const iam = require('@aws-cdk/aws-iam');
const path = require('path');

const defaultOptions = {
  memorySize: 256,
  timeout: Duration.seconds(30),
};

class EdgeLambdaRole extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);

    const managedPolicies = [
      'service-role/AWSLambdaRole',
      'service-role/AWSLambdaBasicExecutionRole',
    ].map(policyName => iam.ManagedPolicy.fromAwsManagedPolicyName(policyName));

    this.role = new iam.Role(parent, 'edge-lambda-role', {
      managedPolicies,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      )
    });
  }
  getRole() {
    return this.role;
  }
}

class LambdaRole extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);

    const dbTableArn = options.table.tableArn;
    const monitorQueueArn = options.monitorQueue.queueArn;
    const snsTopicArn = options.topic.topicArn;

    const managedPolicies = [
      'service-role/AWSLambdaRole',
      'service-role/AWSLambdaBasicExecutionRole',
    ].map(policyName => iam.ManagedPolicy.fromAwsManagedPolicyName(policyName));

    this.role = new iam.Role(parent, 'lambda-role', {
      managedPolicies,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    const document = new iam.PolicyDocument();
    document.addStatements(new iam.PolicyStatement({
      actions: ['sqs:*'],
      effect: iam.Effect.ALLOW,
      resources: [monitorQueueArn]
    }));
    document.addStatements(new iam.PolicyStatement({
      actions: ['sns:*'],
      effect: iam.Effect.ALLOW,
      resources: [snsTopicArn]
    }));
    document.addStatements(new iam.PolicyStatement({
      actions: ['dynamodb:*'],
      effect: iam.Effect.ALLOW,
      resources: [dbTableArn]
    }));
    const policy = new iam.Policy(this, 'lambda-policy', {
      policyName: 'overseer-lambda-policy',
      document,
    });
    policy.attachToRole(this.role);
  }
  getRole() {
    return this.role;
  }
}

class OverseerLambda extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const { code, role, environment, lambdaName, source, nameSuffix } = options;

    this.functionName = `overseer-${lambdaName}${nameSuffix || ''}`;

    this.lambda = new Function(this, name, {
      functionName: this.functionName,
      code: code || Code.fromAsset(path.join(__dirname, `../../functions/${lambdaName}`)),
      handler: options.handler || 'index.handler',
      runtime: Runtime.NODEJS_14_X,
      logRetention: RetentionDays.ONE_MONTH,
      environment,
      role,
      ...defaultOptions,
    });
    if (source) {
      switch (source.type) {
        case 'sqs': {
          this.lambda.addEventSource(new SqsEventSource(source.queue, { batchSize: 10 }));
          break;
        }
        case 'sns': {
          source.topic.addSubscription(new LambdaSubscription(this.lambda));
          break;
        }
        default:
      }
    }
  }
  getLambda() {
    return this.lambda;
  }
}

class ScheduledLambda extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const { lambdaName, environment, rate, role } = options;

    this.functionName = `overseer-${lambdaName}`;

    this.lambda = new Function(this, name, {
      code: Code.fromAsset(path.join(__dirname, `../../functions/${lambdaName}`)),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_14_X,
      environment,
      role,
      ...defaultOptions,
    });

    this.eventRule = new Rule(this, `${this.functionName}-eventrule`, {
      schedule: Schedule.expression(`rate(${rate})`),
      targets: [new LambdaFunction(this.lambda)]
    });
  }
  getLambda() {
    return this.lambda;
  }
  getRule() {
    return this.eventRule;
  }
}

module.exports = {
  EdgeLambdaRole,
  LambdaRole,
  ScheduledLambda,
  OverseerLambda,
};