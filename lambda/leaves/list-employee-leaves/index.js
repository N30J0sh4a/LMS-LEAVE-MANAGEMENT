const { BatchGetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const {LEAVE_STATUS} = require('../../shared/constants');

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
        const items = result.Items || [];

        // Enrich leave rows with employee profile display data when available.
        const uniqueEmployeeIds = [...new Set(items.map((item) => item.employeeId).filter(Boolean))];
        let profilesByEmployeeId = {};

        if (uniqueEmployeeIds.length > 0) {
            const profileKeys = uniqueEmployeeIds.map((id) => ({
                PK: `user#${id}`,
                SK: 'profile',
            }));

            const profileResult = await db.send(new BatchGetCommand({
                RequestItems: {
                    [TABLE]: {
                        Keys: profileKeys,
                        ProjectionExpression: 'PK, #fullName, email',
                        ExpressionAttributeNames: {
                            '#fullName': 'fullName',
                        },
                    },
                },
            }));

            const profileItems = profileResult.Responses?.[TABLE] || [];
            profilesByEmployeeId = Object.fromEntries(
                profileItems.map((profile) => [
                    String(profile.PK).replace('user#', ''),
                    {
                        employeeName: profile.fullName || null,
                        employeeEmail: profile.email || null,
                    },
                ])
            );
        }

        const enrichedItems = items.map((item) => ({
            ...item,
            ...(profilesByEmployeeId[item.employeeId] || {}),
        }));

        const  responseData = {
            items: enrichedItems,
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
