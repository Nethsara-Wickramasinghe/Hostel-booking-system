const fs = require('fs');
const multer = require('multer');

exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, () => {}); // don't keep uploads from failed requests
  let status = err.status || 500;
  let message = err.message;

  if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller' : err.message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : message });
};
