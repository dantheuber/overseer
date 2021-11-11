const { Construct } = require("@aws-cdk/core");
const { HttpApi, HttpMethod } = require('@aws-cdk/aws-apigatewayv2');
const { LambdaProxyIntegration } = require('@aws-cdk/aws-apigatewayv2-integrations');

class RestApi extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const {
      getFunction,
      getSiteFunction,
      postFunction,
      putFunction,
      deleteFunction,
      callbackFunction
    } = options;


    this.api = new HttpApi(parent, 'http-api', {
      apiName: 'overseer-rest-api',
    });
    this.api.addRoutes({
      path: '/api/sites',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getFunction }),
    });
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getSiteFunction }),
    });
    this.api.addRoutes({
      path: '/api/sites',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: postFunction }),
    });
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.PUT],
      integration: new LambdaProxyIntegration({ handler: putFunction }),
    });
    this.api.addRoutes({
      path: '/api/sites/{siteId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteFunction }),
    });
    // this.api.addRoutes({
    //   path: '/api/callback',
    //   methods: [HttpMethod.POST, HttpMethod.GET],
    //   integration: new LambdaProxyIntegration({ handler: callbackFunction }),
    // });
  }

  getApi() {
    return this.api;
  }
}

module.exports = { RestApi };