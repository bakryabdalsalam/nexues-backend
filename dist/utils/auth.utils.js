"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = exports.validatePassword = exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("../middleware/error.middleware");
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const hashPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePasswords = async (password, hashedPassword) => {
    return bcrypt_1.default.compare(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const validatePassword = (password) => {
    // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isValid = passwordRegex.test(password);
    return {
        isValid,
        message: isValid ? '' : 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    };
};
exports.validatePassword = validatePassword;
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
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
