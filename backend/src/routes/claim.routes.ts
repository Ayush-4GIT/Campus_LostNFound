import { Router } from 'express';
import {
  createClaim, getMyClaims, getClaimsForItem,
  getClaimById, approveClaim, rejectClaim,
} from '../controllers/claim.controller';
import { protect }  from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload }   from '../middleware/upload.middleware';
import { createClaimSchema } from '../schemas/claim.schema';

const router = Router();

router.use(protect);

router.post('/',                    upload.single('proofImage'), validate(createClaimSchema), createClaim);
router.get('/me',                   getMyClaims);
router.get('/item/:itemId',         getClaimsForItem);
router.get('/:id',                  getClaimById);
router.put('/:id/approve',          approveClaim);
router.put('/:id/reject',           rejectClaim);

export default router;
