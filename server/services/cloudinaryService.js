const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are provided in process.env
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a file buffer or base64 to Cloudinary
 * Falls back gracefully to local static storage if Cloudinary credentials are not present in .env
 */
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  const folder = options.folder || 'aaradhya';

  // 1. If Cloudinary credentials exist, upload to Cloudinary directly
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: options.resource_type || 'image',
          transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url || result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // 2. Fallback: Save to public uploads directory with persistent file serving
  const uploadsDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${folder}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.jpg`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);

  const localUrl = `/uploads/${filename}`;
  return {
    url: localUrl,
    secure_url: localUrl,
    public_id: `local_${filename}`,
  };
};

module.exports = {
  uploadToCloudinary,
  cloudinary,
};
