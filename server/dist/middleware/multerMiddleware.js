"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.uploadDocumentWithFields = exports.uploadDocumentField = exports.uploadDocumentSingle = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define allowed file types
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});
// File filter function
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
    }
};
// File filter for documents (images and PDFs)
const documentFileFilter = (req, file, cb) => {
    // Check MIME type
    if (allowedDocumentTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, PNG, or PDF allowed'));
    }
};
// Configure multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files
    }
});
// Configure multer for documents (PDF + Images)
const uploadDoc = (0, multer_1.default)({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per document file
        files: 1 // One document at a time
    }
});
// Export middleware functions
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 10); // Allow up to 10 images
exports.uploadFields = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'profileImage', maxCount: 1 }
]);
// Export document upload middleware
exports.uploadDocumentSingle = uploadDoc.single('document');
exports.uploadDocumentField = uploadDoc.single('file');
exports.uploadDocumentWithFields = uploadDoc.fields([
    { name: 'file', maxCount: 1 }
]);
// Error handling middleware
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.handleMulterError = handleMulterError;
