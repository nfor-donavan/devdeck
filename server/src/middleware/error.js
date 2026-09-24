import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (_req, _res, next) => next(new ApiError(404, 'Not found'));

export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'That already exists';
  }
  if (status >= 500) {
    console.error(err);
    if (env.production) message = 'Server error';
  }
  res.status(status).json({ error: message });
}
