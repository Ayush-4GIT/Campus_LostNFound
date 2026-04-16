import { z } from 'zod';

export const createClaimSchema = z.object({
  itemId:           z.string().min(1, 'Item ID is required'),
  ownerDescription: z.string().min(10, 'Please describe your item in detail (min 10 chars)'),
});
