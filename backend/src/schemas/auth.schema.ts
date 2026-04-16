import { z } from 'zod';

export const signupSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  studentId:  z.string().min(3, 'Student ID is required'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2, 'Department is required'),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword:     z.string().min(6, 'New password must be at least 6 characters'),
});
