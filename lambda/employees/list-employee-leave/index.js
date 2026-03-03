const {QueryCommand, UpdateCommand} = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const { LEAVE_STATUS, VALID_TRANSITIONS } = require('../../shared/constants');
const { decrypt } = require('../../shared/encryption');
const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    try{
        const {employeeId} = event.pathParameters;
        const {status, limit, nextToken} = event.queryStringParameters || {};

        if(!employeeId){
            return error('employeeId is required', 400);
        }

        if(status && !Object.values(LEAVE_STATUS).includes(status)){
            return error(`Invalid status. Must be one of: ${Object.values(LEAVE_STATUS).join(', ')}`, 400);
        }

        const params = {
            TableName: TABLE,
            IndexName: 'StatusIndex',
            KeyConditionExpression: 'GSI1PK = :gsi1pk',
            FilterExpression: 'employeeId = :employeeId',
            ExpressionAttributeValues: {
                ':employeeId': employeeId,
                ':gsi1pk': status ? `status#${status}` : `status#${LEAVE_STATUS.PENDING}`,
            },
            Limit: limit ? parseInt(limit) : 20, // limit ung rereturn
        };

        if(!status){ // lalagas lahat ng leave status kapag alang nilagay
            const allStatuses = Object.values(LEAVE_STATUS);
            const allResults = await Promise.all(
                allStatuses.map(s =>
                    db.send(new QueryCommand({
                        ...params,
                        ExpressionAttributeValues: {
                            ':employeeId': employeeId,
                            ':gsi1pk': `status#${s}`,
                        },
                    }))
                )
            );

            const items = allResults.flatMap(r => r.Items || []);
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
            return success({
                items,
                count: items.length,
                employeeId,
            });
        }

        if(nextToken){
            params.ExclusiveStartKey = JSON.parse(
                Buffer.from(nextToken, 'base64').toString('utf8')
            );
        }

        const result = await db.send(new QueryCommand(params));

        const items = (result.Items || []).map(item => ({
                    ...item,
                    reason: decrypt(item.reason),
                }));

        const responseData = {
            items,
            count: result.Count || 0,
            employeeId,
        };

        if(result.LastEvaluatedKey){
            responseData.nextToken = Buffer.from(
                JSON.stringify(result.LastEvaluatedKey)
            ).toString('base64');
        }

        return success(responseData);
    } catch(err){
        return error(err.message || 'Internal server error', err.statusCode || 500);
    }
}