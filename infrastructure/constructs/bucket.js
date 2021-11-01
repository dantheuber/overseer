const path = require('path');
const { PolicyStatement } = require('@aws-cdk/aws-iam');
const { RemovalPolicy, Construct, Duration } = require('@aws-cdk/core');
const { Bucket, BucketEncryption, HttpMethods } = require('@aws-cdk/aws-s3');
const { BucketDeployment, Source } = require('@aws-cdk/aws-s3-deployment');
const { Runtime, Code, Function } = require('@aws-cdk/aws-lambda');
const {
  OriginAccessIdentity,
  CloudFrontWebDistribution,
  ViewerProtocolPolicy,
  PriceClass,
  CloudFrontAllowedMethods,
  LambdaEdgeEventType,
  ViewerCertificate
} = require('@aws-cdk/aws-cloudfront');
const { EdgeLambdaRole } = require('./lambda');

class DashboardBucket extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const { api, env: {region} } = options;

    const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-oai', {
      comment: 'Allows cloudfront access to S3 bucket'
    });

    this.bucket = new Bucket(parent, 'dashboard-bucket', {
      bucketName: 'overseer-dashboard',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      encryption: BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [{
        allowedOrigins: ['*'],
        allowedMethods: [HttpMethods.GET],
        maxAge: 3000,
      }]
    });

    new BucketDeployment(this, 'deploy-static-content', {
      sources: [Source.asset(path.join(__dirname, '../../dashboard'))],
      destinationBucket: this.bucket,
      retainOnDelete: false,
    });

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Grant Cloudfront Origin Access Identity access to s3 bucket',
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/*`],
        principals: [cloudfrontOAI.grantPrincipal]
      })
    );

    const edgeRole = new EdgeLambdaRole(this, 'redirect-role');
    const redirectLambda = new Function(this, 'redirect-lambda', {
      functionName: 'overseer-cdn-redirect',
      code: Code.fromAsset(path.join(__dirname, '../../functions/redirect')),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      memorySize: 128,
      timeout: Duration.seconds(30),
      role: edgeRole.getRole(),
    });

    this.cloudfrontDistribution = new CloudFrontWebDistribution(this, 'cloudfront-distribution', {
      comment: 'CDN for overseer',
      defaultRootObject: 'index.html',
      viewerCertificate: {
        aliases: [process.env.DASHBOARD_DOMAIN],
        props: {
          acmCertificateArn: process.env.ACM_CERT_ARN,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.1_2016'
        }
      },
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      priceClass: PriceClass.PRICE_CLASS_100,
      originConfigs: [{
        customOriginSource: {
          domainName: `${api.httpApiId}.execute-api.${region}.amazonaws.com`,
        },
        behaviors: [{
          pathPattern: '/api/*', // cloudfront will forward all /api/* to apig
          allowedMethods: CloudFrontAllowedMethods.ALL,
          defaultTtl: Duration.seconds(0),
          forwardedValues: {
            queryString: true,
            headers: ['Authorization']
          }
        }]
      },
      {
        s3OriginSource: {
          s3BucketSource: this.bucket,
          originAccessIdentity: cloudfrontOAI,
        },
        behaviors: [{
          compress: true,
          isDefaultBehavior: true,
          defaultTtl: Duration.seconds(0),
          allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
          lambdaFunctionAssociations: [{
            lambdaFunction: redirectLambda.currentVersion,
            eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
          }]
        }]
      }]
    })
  }

  getBucket() {
    return this.bucket;
  }
  getCloudfrontDistro() {
    return this.cloudfrontDistribution;
  }
};

module.exports = { DashboardBucket };
