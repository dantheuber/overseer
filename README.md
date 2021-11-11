# Overseer

A relatively lightweight url monitoring service capable of running on free tier AWS.

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