import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export default function generateToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpire });
}
