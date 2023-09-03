const { Construct } = require("@aws-cdk/core");
const { HttpApi, HttpMethod } = require('@aws-cdk/aws-apigatewayv2');
const { HttpLambdaIntegration } = require('@aws-cdk/aws-apigatewayv2-integrations');

class RestApi extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const {
      authorizer: defaultAuthorizer,
      getFunction,
      getSiteFunction,
      postFunction,
      putFunction,
      deleteFunction,
    } = options;


    this.api = new HttpApi(parent, 'http-api', {
      apiName: 'overseer-rest-api',
      defaultAuthorizer,
    });
    const getSitesIntegration = new HttpLambdaIntegration('get-sites-integration', getFunction);
    this.api.addRoutes({
      path: '/api/sites',
      methods: [HttpMethod.GET],
      integration: getSitesIntegration,
    });
    const getSiteByIdIntegration = new HttpLambdaIntegration('get-site-integration', getSiteFunction);
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.GET],
      integration: getSiteByIdIntegration,
    });
    const postSiteIntegration = new HttpLambdaIntegration('post-site-integration', postFunction);
    this.api.addRoutes({
      path: '/api/sites',
      methods: [HttpMethod.POST],
      integration: postSiteIntegration,
    });
    const putSiteIntegration = new HttpLambdaIntegration('put-site-integration', putFunction);
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.PUT],
      integration: putSiteIntegration,
    });
    const deleteSiteIntegration = new HttpLambdaIntegration('delete-site-integration', deleteFunction);
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.DELETE],
      integration: deleteSiteIntegration,
    });
  }

  getApi() {
    return this.api;
  }
}

module.exports = { RestApi };