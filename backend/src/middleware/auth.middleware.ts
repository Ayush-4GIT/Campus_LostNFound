import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
import User from '../models/User';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check cookie first, then Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw new ApiError(401, 'User no longer exists.');

  req.user = user;
  next();
});
