"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
exports.default = cloudinary_1.v2;
// Utility functions for Cloudinary operations
const uploadToCloudinary = (filePath, folder = 'auto-gear-vehicles') => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(filePath, {
            folder: folder,
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.deleteFromCloudinary = deleteFromCloudinary;
