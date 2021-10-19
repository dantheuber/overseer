import { Construct, Duration } from '@aws-cdk/core';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Rule } from '@aws-cdk/aws-events';
import iam from '@aws-cdk/aws-iam';

const defaultOptions = {
  memorySize: 256,
  timeout: Duration.seconds(300),
};

export class LambdaRole extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);

    const dbTableArn = options.table.tableArn;
    const monitorQueueArn = options.monitorQueue.queueArn;
    const alertQueueArn = options.alertQueue.queueArn;
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
      resources: [monitorQueueArn, alertQueueArn]
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

export class OverseerLambda extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const { role, environment, lambdaName, source } = options;

    this.functionName = `overseer-${lambdaName}`;

    this.lambda = new Function(this, name, {
      functionName: this.functionName,
      code: Code.fromAsset(path.join(__dirname, `../../functions/${lambdaName}`)),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_14_X,
      environment,
      role,
      ...defaultOptions,
    });
    if (source) {
      this.lambda.addEventSource(new SqsEventSource(source));
    }
  }
  getLambda() {
    return this.lambda;
  }
}

export class ScheduledLambda extends Construct {
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