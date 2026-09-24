import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export default function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Sign in required'));
  try {
    req.user = { id: jwt.verify(token, env.jwtSecret).sub };
    next();
  } catch {
    next(new ApiError(401, 'Session expired, please sign in again'));
  }
}
