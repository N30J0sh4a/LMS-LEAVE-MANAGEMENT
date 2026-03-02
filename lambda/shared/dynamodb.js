const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const client = new DynamoDBClient({region: process.env.AWS_REGION || 'ap-southeast-2'});
const db = DynamoDBDocumentClient.from(client);

module.exports = db;