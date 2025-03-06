"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const upload_service_1 = require("../services/upload.service");
exports.uploadController = {
    uploadResume: async (req, res) => {
        try {
            upload_service_1.resumeUpload.single('resume')(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded',
                    });
                }
                const fileUrl = (0, upload_service_1.getFileUrl)(req, req.file.filename, 'resume');
                res.json({
                    success: true,
                    url: fileUrl,
                });
            });
        }
        catch (error) {
            console.error('Resume upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading resume',
            });
        }
    },
    uploadLogo: async (req, res) => {
        try {
            upload_service_1.logoUpload.single('logo')(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded',
                    });
                }
                const fileUrl = (0, upload_service_1.getFileUrl)(req, req.file.filename, 'logo');
                res.json({
                    success: true,
                    url: fileUrl,
                });
            });
        }
        catch (error) {
            console.error('Logo upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading logo',
            });
        }
    },
};
