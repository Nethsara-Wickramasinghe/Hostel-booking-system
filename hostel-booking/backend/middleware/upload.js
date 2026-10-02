const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const HttpError = require('../utils/HttpError');

const dir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(dir, { recursive: true });
const TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

module.exports = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + TYPES[file.mimetype]),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB
  fileFilter: (req, file, cb) =>
    TYPES[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Only JPEG, PNG or WebP images are allowed')),
});
