const {
    expect,
} = require('chai');
const {
    describe,
    it,
    beforeEach,
} = require('mocha');
const mongoose = require('mongoose');
const {
    forTest,
} = require('../controllers/employer_auth_controller');
const Employer = require('../models/employer_model');

describe('Employer Auth Controller Tests...', () => {
    beforeEach(() => {
        delete mongoose.connection.models[Employer];
    });

    it('My first chait test...', () => {
        const a = 2;
        const b = 3;
        const actualValue = forTest(a, b);
        const expectedResult = 5;
        expect(actualValue).to.equal(expectedResult);
    });
});