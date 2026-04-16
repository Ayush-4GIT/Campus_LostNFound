import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller';
import { protect }  from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload }   from '../middleware/upload.middleware';
import { changePasswordSchema } from '../schemas/auth.schema';

const router = Router();

router.use(protect);

router.get('/profile',  getProfile);
router.put('/profile',  upload.single('avatar'), updateProfile);
router.put('/password', validate(changePasswordSchema), changePassword);

export default router;
