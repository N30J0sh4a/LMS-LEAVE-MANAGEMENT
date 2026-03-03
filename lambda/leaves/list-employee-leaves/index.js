const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const {LEAVE_STATUS} = require('../../shared/constants');
const { decrypt } = require('../../shared/encryption');
const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    try {
        const {status, employeeId, limit, nextToken} = event.queryStringParameters || {};

        if(!status) {// checks if status is valid
            return error('status query parameter is required', 400)
        }

        if(!Object.values(LEAVE_STATUS).includes(status)){
            return error(`Invalid status. Must be one of: ${Object.values(LEAVE_STATUS).join(', ')}`, 400);
        }

        const params = {
            TableName: TABLE,
            IndexName: 'StatusIndex',
            KeyConditionExpression: 'GSI1PK = :gsi1pk',
            ExpressionAttributeValues: {
                ':gsi1pk': `status#${status}`,
            },
            Limit: limit ? parseInt(limit) : 20, // limit ung rereturn
        };

        if(employeeId){// if need mag filter ng employeeId
            params.FilterExpression = 'employeeId = :employeeId';
            params.ExpressionAttributeValues[':employeeId'] = employeeId;
        }

        if(nextToken) {// if mas marami sa 20 an
            params.ExclusiveStartKey = JSON.parse(
                Buffer.from(nextToken, 'base64').toString('utf-8')
            );
        }

        const result = await db.send(new QueryCommand(params));
        
        const items = (result.Items || []).map(item => ({
            ...item,
            reason: decrypt(item.reason),
        }));

        const  responseData = {
            items,
            count: result.Count || 0,
        };

        if (result.LastEvaluatedKey){
            responseData.nextToken = Buffer.from(
                JSON.stringify(result.LastEvaluatedKey)
            ).toString('base64')
        }

        return success(responseData);
    } catch (err){
        return error(err.message || 'Internal server error', err.statusCode || 500);
    }
};