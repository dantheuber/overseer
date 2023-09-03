const { Construct, Fn } = require('@aws-cdk/core');
const xray = require('@aws-cdk/aws-xray');

class XrayGroup extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);

    this.cfnGroup = new xray.CfnGroup(this, 'xray-group', {
      groupName: 'overseer-group',
      filterExpression: Fn.sub('resource.arn = "${ProducerFunction.Arn}" OR resource.arn = "${Queue.Arn}" OR resource.arn = "${CollectorFunction.Arn}"'),
      insightsConfiguration: {
        insightsEnabled: true,
        notificationsEnabled: false,
      },
    });
  }
  getGroup() {
    return this.cfnGroup;
  }
}

module.exports = { XrayGroup };