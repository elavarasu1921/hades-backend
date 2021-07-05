const AccessControl = require('accesscontrol');

const grantsObject = {
    admin: {
        Candidates: {
            'read:any': ['*', '!name'],
        },
    },

};

const accessControl = new AccessControl(grantsObject);
module.exports.accessControl = accessControl;