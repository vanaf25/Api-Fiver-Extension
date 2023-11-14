"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 400) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    static NotFound(message) {
        return new ApiError(message || "Not found!", 404);
    }
    static ServerError() {
        return new ApiError("Server error!", 500);
    }
    static defaultError(message, statusCode = 400) {
        return new ApiError(message, statusCode);
    }
    static defaultErrorByKey(message, statusCode = 400) {
        return new ApiError(message, statusCode);
    }
    static UnauthorizedError(message) {
        return new ApiError(message, 401);
    }
}
exports.default = ApiError;
