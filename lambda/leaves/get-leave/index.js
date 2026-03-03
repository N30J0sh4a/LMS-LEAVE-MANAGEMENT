const {QueryCommand} = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const { decrypt } = require('../../shared/encryption');
const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    try{
        const {leaveId} = event.pathParameters;

        if(!leaveId){
            return error('leaveId is required', 400);
        }

        const result = await db.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `leave#${leaveId}`,
            },
        }));

        if (!result.Items || result.Items.length === 0){
            return error('Leave request not found', 404);
        }

        const leave = result.Items[0]; // test ko pa to if tama order
        leave.reason = decrypt(leave.reason);

        return success(result.Items[0]);
    } catch(err){
        return error(err.message || 'Internal server error', err.statusCode || 500);
    }
};