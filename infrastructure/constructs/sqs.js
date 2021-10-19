import { Construct } from '@aws-cdk/core';
import { Queue } from '@aws-cdk/aws-sqs';

export class Sqs extends Construct {
  constructor(parent, id, props) {
    super(parent, id, props);
    
    this.monitorQueue = new Queue(parent, `monitor-${id}`, {
      queueName: 'checkup-queue',
    });
    this.alertQueue = new Queue(parent, `alert-${id}`, {
      queueName: 'alert-queue',
    });
  }

  getMonitorQueue() {
    return this.monitorQueue;
  }
  getAlertQueue() {
    return this.alertQueue;
  }
}