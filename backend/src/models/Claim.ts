import mongoose, { Document, Schema } from 'mongoose';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface IClaim extends Document {
  item:             mongoose.Types.ObjectId;
  claimedBy:        mongoose.Types.ObjectId;
  ownerDescription: string;
  proofImageUrl?:   string;
  status:           ClaimStatus;
  createdAt:        Date;
  updatedAt:        Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    item:             { type: Schema.Types.ObjectId, ref: 'Item',  required: true },
    claimedBy:        { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    ownerDescription: { type: String, required: true, trim: true },
    proofImageUrl:    { type: String, default: null },
    status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model<IClaim>('Claim', ClaimSchema);
