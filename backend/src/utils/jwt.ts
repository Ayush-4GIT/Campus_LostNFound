import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { id: string };
};

export const setCookieToken = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearCookieToken = (res: Response): void => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
};
