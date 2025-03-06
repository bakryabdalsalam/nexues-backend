"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCompany = exports.requireAdmin = exports.checkRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../config/prisma");
// Create a type assertion function
const assertAuthenticated = (req) => {
    if (!('user' in req) || !req.user) {
        throw new Error('User is not authenticated');
    }
};
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const token = authHeader.split(' ')[1];
        // Verify token
        const decoded = (0, jwt_1.verifyToken)(token);
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true
            }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        // Add user to request object with explicit type
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticate = authenticate;
const checkRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - Insufficient permissions'
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
const requireAdmin = (req, res, next) => {
    const authenticatedReq = req;
    if (authenticatedReq.user?.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireCompany = (req, res, next) => {
    const authenticatedReq = req;
    if (authenticatedReq.user?.role !== 'COMPANY') {
        return res.status(403).json({
            success: false,
            message: 'Company access required'
        });
    }
    next();
};
exports.requireCompany = requireCompany;
