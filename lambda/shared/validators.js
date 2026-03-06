const {LEAVE_TYPES} = require('./constants');
// validates stuff
exports.validateLeaveInput = ({employeeId, leaveType, startDate, endDate, department, position, reason}) => {
  if(!employeeId || !leaveType || !startDate || !endDate) {
    throw{ statusCode: 400, message: 'Missing required fields: employeeId, leaveType, startDate, endDate'};
  }

  if(!department || !String(department).trim()){
    throw { statusCode: 400, message: 'department is required' };
  }

  if(!position || !String(position).trim()){
    throw { statusCode: 400, message: 'position is required' };
  }

  if(!reason || !String(reason).trim()){
    throw { statusCode: 400, message: 'reason is required' };
  }

  if(!LEAVE_TYPES.includes(leaveType)){
    throw{ statusCode: 400, message: `leaveType is Invalid. Must be one of: ${LEAVE_TYPES.join(', ')}` }; // use ` not '
  }

  if(new Date(startDate) >= new Date(endDate)){
    throw{ statusCode: 400, message: 'startDate must be before endDate'};
  }
  
};
