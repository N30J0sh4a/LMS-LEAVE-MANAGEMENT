const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
// connection sa database // DynamoDBDocumentClient nag hahandle sa pagconvert ng js object to dynamoDB from at vice versa.
const client = new DynamoDBClient({region: process.env.AWS_REGION});
const db = DynamoDBDocumentClient.from(client);

module.exports = db;