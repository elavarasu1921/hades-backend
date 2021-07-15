class EmpError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }

    static badRequest(msg) {
        return new EmpError(400, msg);
    }

    static internal(msg) {
        return new EmpError(500, msg);
    }
}

module.exports = EmpError;