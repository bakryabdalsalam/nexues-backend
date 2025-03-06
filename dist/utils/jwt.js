"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("../middleware/error.middleware");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const generateToken = (userId, role, email, expiresIn = '15m') => {
    const secret = JWT_SECRET;
    const payload = {
        id: userId,
        role,
        email
    };
    // Cast expiresIn to any to bypass type checking for the expiresIn option
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded || !decoded.id || !decoded.role) {
            throw new error_middleware_1.AppError(401, 'Invalid token payload');
        }
        return decoded;
    }
    catch (error) {
        console.error('Token verification error:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new error_middleware_1.AppError(401, 'Token expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new error_middleware_1.AppError(401, 'Invalid token');
        }
        throw new error_middleware_1.AppError(401, 'Token verification failed');
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
