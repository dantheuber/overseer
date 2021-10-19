import { Construct } from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns';

export class Sns extends Construct {
  constructor(parent, id, props) {
    super(parent, id, props);
    const topicName = 'alert-topic';
    this.topic = new Topic(parent, id, {
      topicName,
    });
  }

  getTopic() {
    return this.topic;
  }
}