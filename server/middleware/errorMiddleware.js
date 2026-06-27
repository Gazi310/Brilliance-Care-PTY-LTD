import config from '../config/index.js';

// 404 handler — forwards to the error handler below.
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found — ${req.originalUrl}`));
}

// Central error handler — returns a clean JSON error.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Server error',
    ...(config.nodeEnv === 'production' ? {} : { stack: err.stack }),
  });
}
