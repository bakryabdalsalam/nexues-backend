"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in dev
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again later'
        });
    }
});
// More strict limiter for auth routes
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 minute in dev, 1 hour in prod
    max: process.env.NODE_ENV === 'development' ? 100 : 5, // 100 attempts in dev, 5 in prod
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development'
                ? 'Too many login attempts, please try again after 1 minute'
                : 'Too many login attempts from this IP, please try again after an hour'
        });
    }
});
// Separate limiter for refresh token endpoint with more lenient limits
exports.refreshTokenLimiter = (0, express_rate_limit_1.default)({
    windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in prod
    max: process.env.NODE_ENV === 'development' ? 300 : 30, // 300 attempts in dev, 30 in prod
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many token refresh attempts, please log in again'
        });
    }
});
