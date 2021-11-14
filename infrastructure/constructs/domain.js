const { Construct } = require('@aws-cdk/core');
const { RecordSet, RecordType, RecordTarget } = require('@aws-cdk/aws-route53');
const {
  CloudFrontTarget,
  BucketWebsiteTarget
} = require('@aws-cdk/aws-route53-targets');

class Domain extends Construct {
  constructor(scope, id, props) {
    super(scope, id);
    const {
      bucket,
      cloudfrontDistribution,
      authCloudFrontDistribution,
    } = props;
    const zone = {
      hostedZoneId: process.env.HOSTED_ZONE_ID,
      zoneName: process.env.DOMAIN_NAME,
    };
    this.rootRecord = new RecordSet(this, 'root-record', {
      zone,
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new BucketWebsiteTarget(bucket)),
    });
    this.dashboardRecord = new RecordSet(this, 'dashboard-record', {
      zone,
      recordType: RecordType.A,
      recordName: process.env.DASHBOARD_DOMAIN.replace(`.${process.env.DOMAIN_NAME}`, ''),
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
    });
    this.authRecord = new RecordSet(this, 'cognito-distribution-record', {
      zone,
      recordType: RecordType.CNAME,
      recordName: 'auth',
      target: RecordTarget.fromValues(authCloudFrontDistribution),
    });
  }

  getDashboardRecord() {
    return this.dashboardRecord;
  }
  getRootRecord() {
    return this.rootRecord;
  }
}

module.exports = { Domain };
