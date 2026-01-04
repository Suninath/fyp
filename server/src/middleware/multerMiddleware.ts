import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Define allowed file types
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const allowedExtensions = ['.jpg', '.jpeg', '.png'];

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Export middleware functions
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10); // Allow up to 10 images
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'profileImage', maxCount: 1 }
]);

// Error handling middleware
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 10 images allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name.' });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }

  next(error);
};