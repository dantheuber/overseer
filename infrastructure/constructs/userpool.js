const { Construct, Duration } = require('@aws-cdk/core');
const { HttpUserPoolAuthorizer } = require('@aws-cdk/aws-apigatewayv2-authorizers');
const { Certificate } = require('@aws-cdk/aws-certificatemanager');
const {
  UserPoolIdentityProviderAmazon,
  UserPoolIdentityProviderGoogle,
  UserPoolClientIdentityProvider,
  AccountRecovery,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  ProviderAttribute,
  VerificationEmailStyle,
  OAuthScope,
  Mfa,
} = require('@aws-cdk/aws-cognito');

class Pool extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);

    this.pool = new UserPool(this, 'overseer-user-pool', {
      userPoolName: 'overseer-user-pool',
      selfSignUpEnabled: true,
      userInvitation: {
        emailSubject: 'Welcome to Overseer!',
        emailBody: 'Greetings {username}! <br /> You have been invited to use overseer! <br /> Your temporary password is {####}',
        smsMessage: 'Greetings {username}! You have been invited to use overseer! Your temporary password is {####}',
      },
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(3),
      },
      accessTokenValidity: Duration.days(7),
      refreshTokenValidity: Duration.days(7),
      idTokenValidity: Duration.days(7),
      accountRecovery: AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      signInCaseSensitive: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
        sms: true,
      },
      deviceTracking: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true,
      },
      userVerification: {
        emailSubject: 'Overseer: Please verify your email address',
        emailBody: 'Hello {username}, <br/> Thank you for signing up! Your verification code is <br /> {####}',
        emailStyle: VerificationEmailStyle.CODE,
        emailSender: 'Overseer',
        emailSenderAlias: 'Overseer',
        emailSenderVerified: true,
        smsMessage: 'Your verification code is {####}',
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.AMAZON,
        UserPoolClientIdentityProvider.GOOGLE,
        UserPoolClientIdentityProvider.COGNITO,
      ],
      mfa: Mfa.OPTIONAL,
      mfaMessage: 'Your verification code is {####}',
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
    });

    const amazonProvider = new UserPoolIdentityProviderAmazon(this, 'amazon', {
      clientId: process.env.AMAZON_CLIENT_ID,
      clientSecret: process.env.AMAZON_CLIENT_SECRET,
      userPool: this.pool,
      attributeMapping: {
        email: ProviderAttribute.AMAZON_EMAIL,
        name: ProviderAttribute.AMAZON_NAME,
      },
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'google', {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      userPool: this.pool,
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        name: ProviderAttribute.GOOGLE_NAME,
        phone_number: ProviderAttribute.GOOGLE_PHONE_NUMBERS,
      },
    });

    this.client = new UserPoolClient(this, 'overseer-user-pool-client', {
      userPool: this.pool,
      userPoolClientName: 'overseer-user-pool-client',
      accessTokenValidity: Duration.hours(12),
      refreshTokenValidity: Duration.days(1),
      generateSecret: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        callbackUrls: [
          `https://${process.env.DASHBOARD_DOMAIN}`,
          `https://${process.env.DASHBOARD_DOMAIN}/`,
          'http://localhost:3000', // for local development
        ],
        scopes: [
          OAuthScope.PROFILE,
          OAuthScope.EMAIL,
          OAuthScope.OPENID,
        ],
        flows: {
          implicitCodeGrant: true,
        },
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviers: [
        UserPoolClientIdentityProvider.AMAZON,
        UserPoolClientIdentityProvider.GOOGLE,
        UserPoolClientIdentityProvider.COGNITO,
      ],
    });
    this.client.node.addDependency(amazonProvider);
    this.client.node.addDependency(googleProvider);

    this.domain = new UserPoolDomain(this, 'overseer-user-pool-domain', {
      userPool: this.pool,
      // cognitoDomain: {
      //   domainPrefix: 'ovrsr',
      // }
      customDomain: {
        domainName: `auth.${process.env.DOMAIN_NAME}`,
        certificate: Certificate.fromCertificateArn(this, 'userpool-domain-certificate', process.env.ACM_CERT_ARN),
      },
    });

    this.authorizer = new HttpUserPoolAuthorizer({
      authorizerName: 'user-pool-authorizer',
      userPool: this.pool,
      userPoolClients: [this.client],
    });
  }
  getPool() {
    return this.pool;
  }
  getClient() {
    return this.client;
  }
  getDomain() {
    return this.domain;
  }
  getAuthorizer() {
    return this.authorizer;
  }
}

module.exports = { Pool };