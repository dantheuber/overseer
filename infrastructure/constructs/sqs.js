const { Construct, Duration } = require('@aws-cdk/core');
const { Queue } = require('@aws-cdk/aws-sqs');

class Sqs extends Construct {
  constructor(parent, id, props) {
    super(parent, id, props);
    
    this.monitorQueue = new Queue(parent, 'monitor', {
      queueName: 'checkup-queue',
      visibilityTimeout: Duration.seconds(30)
    });
  }

  getMonitorQueue() {
    return this.monitorQueue;
  }
}

module.exports = { Sqs };