import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateJobCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('experienceLevel')
    .trim()
    .notEmpty()
    .withMessage('Experience level is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
];

export const validateApplication = [
  body('jobId')
    .trim()
    .notEmpty()
    .withMessage('Job ID is required'),
  body('coverLetter')
    .trim()
    .notEmpty()
    .withMessage('Cover letter is required')
    .isLength({ min: 100 })
    .withMessage('Cover letter must be at least 100 characters long'),
  body('resume')
    .trim()
    .notEmpty()
    .withMessage('Resume link is required')
    .isURL()
    .withMessage('Resume must be a valid URL')
];

function validateResults(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
