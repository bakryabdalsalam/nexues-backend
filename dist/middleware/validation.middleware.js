"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApplication = exports.validateJobCreation = exports.validateLogin = exports.validateRegistration = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
exports.validateJobCreation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required'),
    (0, express_validator_1.body)('company')
        .trim()
        .notEmpty()
        .withMessage('Company name is required'),
    (0, express_validator_1.body)('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required'),
    (0, express_validator_1.body)('experienceLevel')
        .trim()
        .notEmpty()
        .withMessage('Experience level is required'),
    (0, express_validator_1.body)('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    (0, express_validator_1.body)('salary')
        .optional()
        .isNumeric()
        .withMessage('Salary must be a number')
];
exports.validateApplication = [
    (0, express_validator_1.body)('jobId')
        .trim()
        .notEmpty()
        .withMessage('Job ID is required'),
    (0, express_validator_1.body)('coverLetter')
        .trim()
        .notEmpty()
        .withMessage('Cover letter is required')
        .isLength({ min: 100 })
        .withMessage('Cover letter must be at least 100 characters long'),
    (0, express_validator_1.body)('resume')
        .trim()
        .notEmpty()
        .withMessage('Resume link is required')
        .isURL()
        .withMessage('Resume must be a valid URL')
];
function validateResults(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
