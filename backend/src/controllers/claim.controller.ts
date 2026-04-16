import { Request, Response } from 'express';
import Claim from '../models/Claim';
import Item from '../models/Item';
import { sendSuccess, ApiError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// POST /api/claims
export const createClaim = asyncHandler(async (req: Request, res: Response) => {
  const { itemId, ownerDescription } = req.body;

  const item = await Item.findById(itemId);
  if (!item) throw new ApiError(404, 'Item not found');
  if (item.status !== 'found') throw new ApiError(400, 'You can only claim items with status "found"');
  if (item.reportedBy.toString() === req.user!._id.toString()) {
    throw new ApiError(400, 'You cannot claim your own item');
  }

  const existing = await Claim.findOne({ item: itemId, claimedBy: req.user!._id });
  if (existing) throw new ApiError(409, 'You have already submitted a claim for this item');

  const proofImageUrl = req.file ? req.file.path : undefined;

  const claim = new Claim({
    item: itemId,
    claimedBy: req.user!._id,
    ownerDescription,
    proofImageUrl,
  });
  await claim.save();

  await claim.populate([
    { path: 'item',      select: 'title category location imageUrl status' },
    { path: 'claimedBy', select: 'name studentId email' },
  ]);

  sendSuccess(res, claim, 201);
});

// GET /api/claims/me
export const getMyClaims = asyncHandler(async (req: Request, res: Response) => {
  const claims = await Claim.find({ claimedBy: req.user!._id })
    .populate('item', 'title category location imageUrl status date')
    .sort({ createdAt: -1 });
  sendSuccess(res, claims);
});

// GET /api/claims/item/:itemId  — claims on a specific item (for item owner)
export const getClaimsForItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.itemId);
  if (!item) throw new ApiError(404, 'Item not found');
  if (item.reportedBy.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Not authorised to view claims for this item');
  }

  const claims = await Claim.find({ item: req.params.itemId })
    .populate('claimedBy', 'name studentId email department avatarUrl')
    .sort({ createdAt: -1 });
  sendSuccess(res, claims);
});

// GET /api/claims/:id
export const getClaimById = asyncHandler(async (req: Request, res: Response) => {
  const claim = await Claim.findById(req.params.id)
    .populate('item',      'title category location imageUrl status date reportedBy')
    .populate('claimedBy', 'name studentId email department');
  if (!claim) throw new ApiError(404, 'Claim not found');
  sendSuccess(res, claim);
});

// PUT /api/claims/:id/approve
export const approveClaim = asyncHandler(async (req: Request, res: Response) => {
  const claim = await Claim.findById(req.params.id).populate('item');
  if (!claim) throw new ApiError(404, 'Claim not found');

  const item = await Item.findById(claim.item);
  if (!item) throw new ApiError(404, 'Associated item not found');
  if (item.reportedBy.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Only the item reporter can approve claims');
  }

  claim.status   = 'approved';
  item.status    = 'claimed';
  item.claimedBy = claim.claimedBy;

  await Promise.all([claim.save(), item.save()]);

  // Reject all other pending claims for this item
  await Claim.updateMany(
    { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
    { status: 'rejected' }
  );

  sendSuccess(res, { message: 'Claim approved successfully', claim });
});

// PUT /api/claims/:id/reject
export const rejectClaim = asyncHandler(async (req: Request, res: Response) => {
  const claim = await Claim.findById(req.params.id).populate('item');
  if (!claim) throw new ApiError(404, 'Claim not found');

  const item = await Item.findById(claim.item);
  if (!item) throw new ApiError(404, 'Associated item not found');
  if (item.reportedBy.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Only the item reporter can reject claims');
  }

  claim.status = 'rejected';
  await claim.save();
  sendSuccess(res, { message: 'Claim rejected', claim });
});
