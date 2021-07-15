class CndtError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }

    static badRequest(msg) {
        return new CndtError(400, msg);
    }

    static internal(msg) {
        return new CndtError(500, msg);
    }
}

module.exports = CndtError;