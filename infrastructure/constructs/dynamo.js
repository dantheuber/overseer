import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

export class Database extends Construct {
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
      removalPolicy: RemovalPolicy.SNAPSHOT,
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
