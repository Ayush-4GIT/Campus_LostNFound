import { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, ApiError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/users/profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, user);
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, department } = req.body;
  const avatarUrl = req.file ? req.file.path : undefined;

  const update: Record<string, string> = {};
  if (name)       update.name       = name;
  if (department) update.department = department;
  if (avatarUrl)  update.avatarUrl  = avatarUrl;

  const user = await User.findByIdAndUpdate(req.user!._id, update, { new: true, runValidators: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, user);
});

// PUT /api/users/password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user) throw new ApiError(404, 'User not found');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  sendSuccess(res, { message: 'Password updated successfully' });
});
