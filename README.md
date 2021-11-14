# Overseer
A URL monitoring service running 100% serverless in AWS.

## Requirements
- AWS Account
- AWS CLI installed and configured
  - Default profile will be used when deploying
- Docker
- Node 14.x

## Configuration
Add a `.env` file to the root of the project with the following variables declared:
```
// For alerting
DISCORD_WEBHOOK_URL= // the discord webhook url that you would like to use for notifications. (temporary)

// For website hosting and routing
HOSTED_ZONE_ID=yourroute53hostedzoneid
DOMAIN_NAME=yourwebsite.com
DASHBOARD_DOMAIN=dashboard.yourwebsite.com // MUST be a subdomain of DOMAIN_NAME
ACM_CERT_ARN=some:aws:arn // this cert should be issued for your domain name

// for authentication via AWS cognito
AMAZON_CLIENT_ID=youramazonoauthclientid
AMAZON_CLIENT_SECRET=youramazonoauthsecret
GOOGLE_CLIENT_ID=yourgoogleoauthclientid
GOOGLE_CLIENT_SECRET=yourgoogleoauthsecret
```


## Notes
- AFTER first deployment, you will need to create a `config.json` file in the root of the `/dashboard` directory.
- The `config.json` file should contain the following:
```
{
  "userPoolId": "the-user-pool-id",
  "userPoolClientId": "the-user-pool-client-id",
  "authDomain": "auth.yourwebsite.com"
}
```
- You will also have to add the `auth.yourwebsite.com` domain to the cognito custom domain configuration, and add the cloudfront distribution it gives as a result to the route53 hosted zone as a CNAME.

### Stack deployment issues:
  - `UserPoolDomain` seems to get upset about root domain not resolving. Currently have to deploy with random cognito domain first, then manually add custom domain in console and update Route53 record.
  - This is obviously not ideal. I think it can be resolved by splitting up the app into multiple stacks, or by taking another look at inter stack dependencies.

