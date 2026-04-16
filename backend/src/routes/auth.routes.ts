import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/auth.controller';
import { validate }  from '../middleware/validate.middleware';
import { protect }   from '../middleware/auth.middleware';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login',  validate(loginSchema),  login);
router.post('/logout', protect, logout);
router.get('/me',      protect, getMe);

export default router;
