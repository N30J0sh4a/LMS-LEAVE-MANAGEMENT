const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('../../shared/dynamodb');
const { success, error } = require('../../shared/response');
const { LEAVE_STATUS } = require('../../shared/constants');
const { getRequester } = require('../../shared/requester');

const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const requester = await getRequester(event);

    const { employeeId } = event.pathParameters || {};
    const { status, limit, nextToken } = event.queryStringParameters || {};

    if (!employeeId) {
      return error('employeeId is required', 400);
    }

    if (requester.profile.role === 'employee' && requester.uid !== employeeId) {
      return error('Employees can only access their own leave requests.', 403);
    }

    if (status && !Object.values(LEAVE_STATUS).includes(status)) {
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
      Limit: limit ? parseInt(limit, 10) : 20,
    };

    if (!status) {
      const allStatuses = Object.values(LEAVE_STATUS);
      const allResults = await Promise.all(
        allStatuses.map((currentStatus) =>
          db.send(
            new QueryCommand({
              ...params,
              ExpressionAttributeValues: {
                ':employeeId': employeeId,
                ':gsi1pk': `status#${currentStatus}`,
              },
            })
          )
        )
      );

      const items = allResults.flatMap((result) => result.Items || []);
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return success({
        items,
        count: items.length,
        employeeId,
      });
    }

    if (nextToken) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'));
    }

    const result = await db.send(new QueryCommand(params));

    const responseData = {
      items: result.Items || [],
      count: result.Count || 0,
      employeeId,
    };

    if (result.LastEvaluatedKey) {
      responseData.nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return success(responseData);
  } catch (err) {
    return error(err.message || 'Internal server error', err.statusCode || 500);
  }
};
