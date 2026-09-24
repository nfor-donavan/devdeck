import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongo: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devdeck',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  timezone: process.env.TIMEZONE || 'Africa/Douala',
  allowRegister: process.env.ALLOW_REGISTER === 'true',
  production: process.env.NODE_ENV === 'production',
};

if (!env.jwtSecret || env.jwtSecret.length < 16) {
  console.error('Missing JWT_SECRET (16+ characters). Copy server/.env.example to server/.env and set it.');
  process.exit(1);
}
