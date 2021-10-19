const { Construct } = require('@aws-cdk/core');
const { Topic } = require('@aws-cdk/aws-sns');

class Sns extends Construct {
  constructor(parent, id, props) {
    super(parent, id, props);
    const topicName = 'alert-topic';
    this.topic = new Topic(parent, topicName, {
      topicName,
    });
  }

  getTopic() {
    return this.topic;
  }
}

module.exports = { Sns };