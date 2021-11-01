# Overseer

A relatively lightweight url monitoring service capable of running on free tier AWS.

## Configuration
Add a `.env` file to the root of the project with the following variables declared:
```
DISCORD_WEBHOOK_URL // the discord webhook url that you would like to use for notifications. (temporary)
DASHBOARD_DOMAIN // the domain in which you intend to point toward the dashboard. 
ACM_CERT_ARN // the arn of the issued certificate for the domain you are using with the cloudfront distribution
```