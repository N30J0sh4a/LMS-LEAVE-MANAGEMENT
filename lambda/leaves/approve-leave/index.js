const {QueryCommand, UpdateCommand} = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const { LEAVE_STATUS, VALID_TRANSITIONS } = require('../../shared/constants');

const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    try{
        const {leaveId} = event.pathparameters;
        const body = JSON.parse(event.body);

        if(!body.reviewedBy){
            return error('reviewedBy is required', 400);
        }

        const result = await db.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `leave#${leaveId}`,
            },
        }));

        if(!result.Items || result.Items.length === 0){
            return error('Leave request not found', 404);
        }

        const leave = result.Items[0];

        if(leave.status === LEAVE_STATUS.REJECTED){
            return error('Cannot approve an already rejected leave request', 409);
        }

        if (!VALID_TRANSITIONS.approve.includes(leave.status)){
            return error(`Cannot approve a leave that is already ${leave.status}`, 409);
        }

        const now = new Date().toISOString();

        await db.send(new UpdateCommand({
            TableName: TABLE,
            Key: {
                PK : leave.PK,
                SK: leave.SK
            },
            UpdateExpression: 'SET #status = :status, GSI1PK = :gsi1pk, reviewedBy = :reviewedBy, reviewedAt = :reviewedAt, updatedAt = :updateAt',
            ExpressionAttributeNames: {'#status': 'status'},
            ExpressionAttributeValues: {
                ':status': LEAVE_STATUS.APPROVED,
                ':gsi1pk': `status#${LEAVE_STATUS.APPROVED}`,
                ':reviewedBy': body.reviewedBy,
                ':reviewedAt': now,
                ':updatedAt': now,
            },
        }));

        return success({ message: 'Leave request approved successfully', leaveId});
    } catch(err){
        return error(err.message || 'Internal server error', err.statusCode || 500);
    }
};