import { Request, Response } from 'express';
import { resumeUpload, logoUpload, getFileUrl } from '../services/upload.service';

export const uploadController = {
  uploadResume: async (req: Request, res: Response) => {
    try {
      resumeUpload.single('resume')(req, res, (err) => {
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

        const fileUrl = getFileUrl(req, req.file.filename, 'resume');
        res.json({
          success: true,
          url: fileUrl,
        });
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading resume',
      });
    }
  },

  uploadLogo: async (req: Request, res: Response) => {
    try {
      logoUpload.single('logo')(req, res, (err) => {
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

        const fileUrl = getFileUrl(req, req.file.filename, 'logo');
        res.json({
          success: true,
          url: fileUrl,
        });
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading logo',
      });
    }
  },
}; 