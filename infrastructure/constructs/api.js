const { Construct } = require("@aws-cdk/core");
const { HttpApi, HttpMethod } = require('@aws-cdk/aws-apigatewayv2');
const { LambdaProxyIntegration } = require('@aws-cdk/aws-apigatewayv2-integrations');

class RestApi extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    const {
      getFunction,
      postFunction,
      putFunction,
      deleteFunction,
    } = options;


    this.api = new HttpApi(parent, 'http-api', {
      apiName: 'overseer-rest-api',
      corsPreflight: {
        allowOrigins: ['http://localhost:3000']
      }
    });
    this.api.addRoutes({
      path: '/api/list-sites',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getFunction }),
    });
    this.api.addRoutes({
      path: '/api/site',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: postFunction }),
    });
    this.api.addRoutes({
      path: '/api/site',
      methods: [HttpMethod.PUT],
      integration: new LambdaProxyIntegration({ handler: putFunction }),
    });
    this.api.addRoutes({
      path: '/api/site',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({ handler: deleteFunction }),
    });
  }

  getApi() {
    return this.api;
  }
}

module.exports = { RestApi };