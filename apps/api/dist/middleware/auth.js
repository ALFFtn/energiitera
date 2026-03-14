"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_js_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_js_1.AppError('Invalid token', 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_js_1.AppError('Token expired', 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Not authenticated', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_js_1.AppError('Not authorized for this action', 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map