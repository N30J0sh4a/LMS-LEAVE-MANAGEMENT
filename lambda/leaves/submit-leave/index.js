const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const db = require('../../shared/dynamodb');
const { success, error } = require('../../shared/response');
const { validateLeaveInput } = require('../../shared/validators');
const { LEAVE_STATUS } = require('../../shared/constants');
const { getRequester, requireRole } = require('../../shared/requester');

const TABLE = process.env.TABLE_NAME;

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

exports.handler = async (event) => {
  try {
    const requester = await getRequester(event);
    requireRole(requester, 'employee');

    const parsedBody = JSON.parse(event.body || '{}');

    if (parsedBody.employeeId !== requester.uid) {
      return error('You can only submit leave requests for your own account.', 403);
    }

    const body = {
      ...parsedBody,
      employeeId: requester.uid,
      employeeName: requester.profile.fullName || requester.email || null,
      employeeEmail: requester.profile.email || requester.email || null,
      department: normalizeText(parsedBody.department),
      position: normalizeText(parsedBody.position),
      reason: normalizeText(parsedBody.reason),
    };

    validateLeaveInput(body);

    const leaveId = uuidv4();
    const now = new Date().toISOString();

    const leave = {
      PK: `leave#${leaveId}`,
      SK: `createdAt#${now}`,
      leaveId,
      employeeId: body.employeeId,
      employeeName: normalizeText(body.employeeName) || null,
      employeeEmail: normalizeText(body.employeeEmail) || null,
      leaveType: body.leaveType,
      startDate: body.startDate,
      endDate: body.endDate,
      department: body.department,
      position: body.position,
      reason: body.reason,
      status: LEAVE_STATUS.PENDING,
      GSI1PK: `status#${LEAVE_STATUS.PENDING}`,
      GSI1SK: `createdAt#${now}`,
      createdAt: now,
      updatedAt: now,
    };

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: leave,
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    );

    return success(leave, 201);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return error('Leave request already exists', 409);
    }

    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};
