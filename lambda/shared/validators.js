const {LEAVE_TYPES} = require('./constants');
// validates stuff
exports.validateLeaveInput = ({employeeId, leaveType, startDate, endDate}) => {
  if(!employeeId || !leaveType || !startDate || !endDate) {
    throw{ statusCode: 400, message: 'Missing required fields: employeeId, leaveType, startDate, endDate'};
  }
  if(!LEAVE_TYPES.includes(leaveType)){
    throw{ statusCode: 400, message: `leaveType is Invalid. Must be one of: ${LEAVE_TYPES.join(', ')}` }; // use ` not '
  }

  if(new Date(startDate) >= new Date(endDate)){
    throw{ statusCode: 400, message: 'startDate must be before endDate'};
  }
  
};