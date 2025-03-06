"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only PDF, DOC, and DOCX files
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
        }
    }
});
// Resume upload endpoint
router.post('/resume', auth_middleware_1.authenticate, upload.single('resume'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        // Return the file path that can be stored in the database
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                path: `/uploads/resumes/${req.file.filename}`
            }
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
});
exports.uploadRoutes = router;
