exports.LEAVE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
};
// status stuff// stores fixed na values
exports.LEAVE_TYPES = ['SICK', 'VACATION', 'EMERGENCY', 'UNPAID'];

exports.VALID_TRANSITIONS = {
    approve:['PENDING'],
    reject:['PENDING'],
    cancel:['PENDING'],
}