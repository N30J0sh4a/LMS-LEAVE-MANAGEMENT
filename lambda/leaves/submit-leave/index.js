const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const db = require('../../shared/dynamodb');
const {success, error} = require('../../shared/response');
const {validateLeaveInput} = require('../../shared/validators');
const {LEAVE_STATUS} = require('../../shared/constants');

const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        //checks input
        validateLeaveInput(body);

        const leaveId = uuidv4();
        const now = new Date().toISOString();

        const leave = {
            PK: `leave#${leaveId}`,
            SK: `createdAt#${now}`,
            leaveId,
            employeeId: body.employeeId,
            leaveType: body.leaveType,
            startDate: body.startDate,
            endDate: body.endDate,
            status: LEAVE_STATUS.PENDING,
            GSI1PK: `status#${LEAVE_STATUS.PENDING}`,
            GsI1SK: `createdAt#${now}`,
            createAt: now,
            updateAt: now,
        };
        
        await db.send(new PutCommand({//saves the leave in the table
            TableName: TABLE,
            Item: leave,
            ConditionExpression: 'attribute_not_exists(PK)',
        }));

        return success(leave, 201);

    } catch(err){
        if(err.name === 'ConditionalCheckFailedException'){
            return error('Leave request already exists', 409)
        }
        return error(err.message || 'Internal server error', err.statusCode || 500);
    }
};