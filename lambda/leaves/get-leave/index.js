const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const { success, error } = require('../../shared/response');
const { getRequester } = require('../../shared/requester');

const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const requester = await getRequester(event);
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
    const isOwner = leave.employeeId === requester.uid;
    const isManager = requester.profile.role === 'manager';

    if (!isOwner && !isManager) {
      return error('You are not authorized to view this leave request.', 403);
    }

    return success(leave);
  } catch (err) {
    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};
