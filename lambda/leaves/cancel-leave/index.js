const { QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const { success, error } = require('../../shared/response');
const { LEAVE_STATUS, VALID_TRANSITIONS } = require('../../shared/constants');
const { getRequester, requireRole } = require('../../shared/requester');

const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const requester = await getRequester(event);
    requireRole(requester, 'employee');

    const { leaveId } = event.pathParameters || {};

    if (!leaveId) {
      return error('leaveId is required', 400);
    }

    const result = await db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `leave#${leaveId}`,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return error('Leave request not found', 404);
    }

    const leave = result.Items[0];

    if (leave.employeeId !== requester.uid) {
      return error('You are not authorized to cancel this leave request', 403);
    }

    if (!VALID_TRANSITIONS.cancel.includes(leave.status)) {
      return error(`Only PENDING leaves can be cancelled. Current status is ${leave.status}`, 409);
    }

    const now = new Date().toISOString();

    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: {
          PK: leave.PK,
          SK: leave.SK,
        },
        UpdateExpression: 'SET #status = :status, GSI1PK = :gsi1pk, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': LEAVE_STATUS.CANCELLED,
          ':gsi1pk': `status#${LEAVE_STATUS.CANCELLED}`,
          ':updatedAt': now,
        },
      })
    );

    return success({ message: 'Leave request cancelled successfully', leaveId });
  } catch (err) {
    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};
