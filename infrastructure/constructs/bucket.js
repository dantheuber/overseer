const path = require('path');
const { RemovalPolicy, Construct } = require('@aws-cdk/core');
const { Bucket, BucketEncryption } = require('@aws-cdk/aws-s3');
const { BucketDeployment, Source } = require('@aws-cdk/aws-s3-deployment');

class DashboardBucket extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    this.logsBucket = new Bucket(parent, 'dashboard-logs-bucket', {
      bucketName: 'overseer-dashboard-logs',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.bucket = new Bucket(parent, 'dashboard-bucket', {
      bucketName: 'overseer-dashboard',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      autoDeleteObjects: true,
      serverAccessLogsBucket: this.logsBucket,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, 'deploy-static-content', {
      sources: [Source.asset(path.join(__dirname, '../../dashboard'))],
      destinationBucket: this.bucket,
      retainOnDelete: false,
    });
  }

  getBucket() {
    return this.bucket;
  }
};

module.exports = { DashboardBucket };
