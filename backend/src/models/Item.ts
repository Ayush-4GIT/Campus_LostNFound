import mongoose, { Document, Schema } from 'mongoose';

export type ItemStatus   = 'lost' | 'found' | 'claimed';
export type ItemCategory = 'electronics' | 'clothing' | 'documents' | 'books' | 'accessories' | 'other';

export interface IItem extends Document {
  title:       string;
  description: string;
  category:    ItemCategory;
  status:      ItemStatus;
  location:    string;
  date:        Date;
  imageUrl?:   string;
  reportedBy:  mongoose.Types.ObjectId;
  claimedBy?:  mongoose.Types.ObjectId;
  createdAt:   Date;
  updatedAt:   Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['electronics', 'clothing', 'documents', 'books', 'accessories', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      required: true,
    },
    location:   { type: String, required: true, trim: true },
    date:       { type: Date, required: true },
    imageUrl:   { type: String, default: null },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy:  { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

ItemSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IItem>('Item', ItemSchema);
