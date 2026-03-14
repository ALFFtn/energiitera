"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    // Log unexpected errors
    console.error('Unexpected error:', err);
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
const notFound = (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
    });
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map