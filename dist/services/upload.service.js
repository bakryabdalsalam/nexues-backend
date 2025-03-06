"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = exports.deleteFile = exports.logoUpload = exports.resumeUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Configure storage for different file types
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = '';
        // Determine upload path based on file type
        if (file.fieldname === 'resume') {
            uploadPath = path_1.default.join(__dirname, '../../uploads/resumes');
        }
        else if (file.fieldname === 'logo') {
            uploadPath = path_1.default.join(__dirname, '../../uploads/logos');
        }
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueId = (0, uuid_1.v4)();
        const extension = path_1.default.extname(file.originalname);
        cb(null, `${uniqueId}${extension}`);
    },
});
// File filter for resumes
const resumeFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
};
// File filter for logos
const logoFilter = (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, PNG, and GIF images are allowed.'));
    }
};
// Configure multer for different upload types
exports.resumeUpload = (0, multer_1.default)({
    storage,
    fileFilter: resumeFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
exports.logoUpload = (0, multer_1.default)({
    storage,
    fileFilter: logoFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
});
// Helper function to delete file
const deleteFile = async (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            await fs_1.default.promises.unlink(filePath);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};
exports.deleteFile = deleteFile;
// Helper function to get file URL
const getFileUrl = (req, filename, type) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${type}s/${filename}`;
};
exports.getFileUrl = getFileUrl;
