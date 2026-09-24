import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { wrap } from '../utils/wrap.js';
import { ApiError } from '../utils/ApiError.js';
import { sendMail } from '../services/mailer.js';

const sign = (u) => jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: env.jwtExpires });
const publicUser = (u) => ({ id: u._id, email: u.email, name: u.name, settings: u.settings });
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const checkPassword = (p) => {
  if (typeof p !== 'string' || p.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
};
const checkEmail = (e) => {
  if (typeof e !== 'string' || !/^\S+@\S+\.\S+$/.test(e)) throw new ApiError(400, 'Enter a valid email');
};

export const register = wrap(async (req, res) => {
  const { email, password, name } = req.body;
  checkEmail(email);
  checkPassword(password);
  // Single-user by default: only the first account can register unless ALLOW_REGISTER=true.
  if (!env.allowRegister && (await User.countDocuments()) > 0) throw new ApiError(403, 'Registration is closed');
  const user = await User.create({ email, name, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

export const login = wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = typeof email === 'string' ? await User.findOne({ email: email.toLowerCase() }).select('+passwordHash') : null;
  const ok = user && typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new ApiError(401, 'Incorrect email or password');
  res.json({ token: sign(user), user: publicUser(user) });
});

export const forgot = wrap(async (req, res) => {
  const { email } = req.body;
  const user = typeof email === 'string' ? await User.findOne({ email: email.toLowerCase() }) : null;
  let devLink;
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await User.updateOne({ _id: user._id }, { resetTokenHash: sha(token), resetExpires: new Date(Date.now() + 3600_000) });
    const link = `${env.clientUrl}/reset-password?token=${token}`;
    await sendMail({ to: user.email, subject: 'Reset your DevDeck password', text: `Open this link within one hour: ${link}` });
    if (!env.production) devLink = link; // no SMTP yet: the link is printed in the server log and returned in dev
  }
  // Same answer whether or not the account exists.
  res.json({ message: 'If that email has an account, a reset link has been sent.', devLink });
});

export const reset = wrap(async (req, res) => {
  const { token, password } = req.body;
  checkPassword(password);
  if (typeof token !== 'string') throw new ApiError(400, 'Invalid or expired link');
  const user = await User.findOne({ resetTokenHash: sha(token), resetExpires: { $gt: new Date() } });
  if (!user) throw new ApiError(400, 'Invalid or expired link');
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated. You can sign in now.' });
});

export const me = wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(401, 'Account not found');
  res.json(publicUser(user));
});

export const saveSettings = wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { name, theme, workdayHours } = req.body;
  if (typeof name === 'string') user.name = name.trim();
  if (['system', 'dark', 'light'].includes(theme)) user.settings.theme = theme;
  if (Number(workdayHours) >= 1 && Number(workdayHours) <= 16) user.settings.workdayHours = Number(workdayHours);
  await user.save();
  res.json(publicUser(user));
});

export const changePassword = wrap(async (req, res) => {
  const { current, password } = req.body;
  checkPassword(password);
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await bcrypt.compare(String(current || ''), user.passwordHash))) throw new ApiError(400, 'Current password is incorrect');
  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  res.json({ message: 'Password changed' });
});
