import { z } from 'zod';

export const createItemSchema = z.object({
  title:       z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category:    z.enum(['electronics', 'clothing', 'documents', 'books', 'accessories', 'other']),
  status:      z.enum(['lost', 'found']),
  location:    z.string().min(2, 'Location is required'),
  date:        z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
});

export const updateItemSchema = createItemSchema.partial();
