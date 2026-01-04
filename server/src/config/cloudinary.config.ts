import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

// Utility functions for Cloudinary operations
export const uploadToCloudinary = (filePath: string, folder: string = 'auto-gear-vehicles') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const deleteFromCloudinary = (publicId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};