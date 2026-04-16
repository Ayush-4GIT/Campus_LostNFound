import { Request, Response } from 'express';
import User from '../models/User';
import { signToken, setCookieToken, clearCookieToken } from '../utils/jwt';
import { sendSuccess, sendError, ApiError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// POST /api/auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, studentId, email, password, department } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
  if (existingUser) throw new ApiError(409, 'Email or Student ID already registered');

  const user = await User.create({ name, studentId, email, password, department });
  const token = signToken(user._id.toString());
  setCookieToken(res, token);

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, studentId: user.studentId, department: user.department, role: user.role },
    token,
  }, 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user._id.toString());
  setCookieToken(res, token);

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, studentId: user.studentId, department: user.department, role: user.role, avatarUrl: user.avatarUrl },
    token,
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearCookieToken(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, user);
});
