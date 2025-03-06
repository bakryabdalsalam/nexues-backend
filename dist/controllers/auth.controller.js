"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const jwt_1 = require("../utils/jwt");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};
const authController = {
    async register(req, res) {
        try {
            const { email, password, name, role = client_1.UserRole.USER } = req.body;
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role,
                    profile: {
                        create: {
                            fullName: name
                        }
                    }
                },
                include: {
                    profile: true
                }
            });
            const accessToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '15m');
            const refreshToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '7d');
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            const { password: _, ...userWithoutPassword } = user;
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userWithoutPassword,
                    token: accessToken
                }
            });
        }
        catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { email },
                include: {
                    profile: true,
                    company: true
                }
            });
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            const accessToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '15m');
            const refreshToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '7d');
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userWithoutPassword,
                    token: accessToken
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async refresh(req, res) {
        try {
            // Try to get token from cookie first, then from Authorization header
            let refreshToken = req.cookies?.refreshToken;
            // If no cookie, check for Authorization header (for environments where cookies don't work)
            if (!refreshToken) {
                const authHeader = req.headers.authorization;
                if (authHeader?.startsWith('Bearer ')) {
                    refreshToken = authHeader.split(' ')[1];
                }
            }
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'No refresh token provided'
                });
            }
            // Use the verifyToken utility to decode and verify the token
            try {
                // Verify the token
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret');
                // Find the user
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: decoded.id },
                    include: {
                        profile: true,
                        company: true
                    }
                });
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid refresh token - user not found'
                    });
                }
                // Generate new tokens
                const accessToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '15m');
                const newRefreshToken = (0, jwt_1.generateToken)(user.id, user.role, user.email, '7d');
                // Set the new refresh token in cookie
                res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
                const { password: _, ...userWithoutPassword } = user;
                return res.json({
                    success: true,
                    data: {
                        user: userWithoutPassword,
                        token: accessToken
                    }
                });
            }
            catch (tokenError) {
                console.error('Token verification error:', tokenError);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token'
                });
            }
        }
        catch (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                message: 'Error processing refresh token'
            });
        }
    },
    async logout(req, res) {
        res.clearCookie('refreshToken', {
            ...COOKIE_OPTIONS,
            maxAge: 0
        });
        return res.json({
            success: true,
            message: 'Logged out successfully'
        });
    },
    async getProfile(req, res) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    profile: true,
                    company: true,
                    applications: true
                }
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            const { password: _, ...userWithoutPassword } = user;
            return res.json({
                success: true,
                data: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching user profile'
            });
        }
    },
    async verifyToken(req, res) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    profile: true,
                    company: true
                }
            });
            if (!user) {
                throw new error_middleware_1.AppError(404, 'User not found');
            }
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Verify token error:', error);
            if (error instanceof error_middleware_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Error verifying token'
                });
            }
        }
    }
};
exports.default = authController;
