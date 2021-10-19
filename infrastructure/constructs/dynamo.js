const { Construct, RemovalPolicy } = require('@aws-cdk/core');
const { Table, AttributeType, BillingMode } = require('@aws-cdk/aws-dynamodb');

class Database extends Construct {
  constructor(parent, name, options) {
    super(parent, name, options);
    
    const { tableName } = options;

    this.table = new Table(parent, 'sites-table', {
      tableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'url',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.table.addGlobalSecondaryIndex({
      indexName: 'status',
      partitionKey: {
        name: 'status',
        type: AttributeType.STRING,
      },
    });
  }
  getTable() {
    return this.table;
  }
}

module.exports = { Database };