import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true, select: false },
    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },
    settings: {
      theme: { type: String, enum: ['system', 'dark', 'light'], default: 'system' },
      workdayHours: { type: Number, default: 6, min: 1, max: 16 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', schema);
