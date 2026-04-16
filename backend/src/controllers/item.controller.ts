import { Request, Response } from 'express';
import Item from '../models/Item';
import { sendSuccess, ApiError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/items
export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, location, search, page = '1', limit = '12' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (search)   filter.$text    = { $search: search };

  const pageNum  = parseInt(page, 10)  || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip     = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Item.find(filter)
      .populate('reportedBy', 'name studentId department avatarUrl')
      .populate('claimedBy',  'name studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Item.countDocuments(filter),
  ]);

  sendSuccess(res, { items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// GET /api/items/my
export const getMyItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await Item.find({ reportedBy: req.user!._id })
    .sort({ createdAt: -1 })
    .populate('claimedBy', 'name studentId');
  sendSuccess(res, items);
});

// GET /api/items/:id
export const getItemById = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id)
    .populate('reportedBy', 'name studentId department email avatarUrl')
    .populate('claimedBy',  'name studentId');
  if (!item) throw new ApiError(404, 'Item not found');
  sendSuccess(res, item);
});

// POST /api/items
export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category, status, location, date } = req.body;
  const imageUrl = req.file ? req.file.path : undefined;

  const item = new Item({
    title, description, category, status, location,
    date: new Date(date),
    imageUrl,
    reportedBy: req.user!._id,
  });
  await item.save();

  await item.populate('reportedBy', 'name studentId department avatarUrl');
  sendSuccess(res, item, 201);
});

// PUT /api/items/:id
export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Item not found');
  if (item.reportedBy.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Not authorised to update this item');
  }

  const { title, description, category, status, location, date } = req.body;
  if (title)       item.title       = title;
  if (description) item.description = description;
  if (category)    item.category    = category;
  if (status)      item.status      = status;
  if (location)    item.location    = location;
  if (date)        item.date        = new Date(date);
  if (req.file)    item.imageUrl    = req.file.path;

  await item.save();
  sendSuccess(res, item);
});

// DELETE /api/items/:id
export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Item not found');
  if (item.reportedBy.toString() !== req.user!._id.toString()) {
    throw new ApiError(403, 'Not authorised to delete this item');
  }
  await item.deleteOne();
  sendSuccess(res, { message: 'Item deleted successfully' });
});
