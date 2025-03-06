"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const handleError = (error) => {
    if (error instanceof AppError) {
        return { statusCode: error.statusCode, message: error.message };
    }
    return { statusCode: 500, message: 'Internal server error' };
};
exports.handleError = handleError;
