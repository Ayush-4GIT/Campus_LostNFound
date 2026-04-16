import { Router } from 'express';
import {
  getItems, getMyItems, getItemById,
  createItem, updateItem, deleteItem,
} from '../controllers/item.controller';
import { protect }   from '../middleware/auth.middleware';
import { validate }  from '../middleware/validate.middleware';
import { upload }    from '../middleware/upload.middleware';
import { createItemSchema, updateItemSchema } from '../schemas/item.schema';

const router = Router();

router.use(protect);

router.get('/',      getItems);
router.get('/my',    getMyItems);
router.get('/:id',   getItemById);
router.post('/',     upload.single('image'), validate(createItemSchema), createItem);
router.put('/:id',   upload.single('image'), validate(updateItemSchema), updateItem);
router.delete('/:id', deleteItem);

export default router;
