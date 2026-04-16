import { User } from './user';

export type ItemStatus   = 'lost' | 'found' | 'claimed';
export type ItemCategory = 'electronics' | 'clothing' | 'documents' | 'books' | 'accessories' | 'other';
export type ClaimStatus  = 'pending' | 'approved' | 'rejected';

export interface LostFoundItem {
  _id:         string;
  title:       string;
  description: string;
  category:    ItemCategory;
  status:      ItemStatus;
  location:    string;
  date:        string;
  imageUrl?:   string | null;
  reportedBy:  User;
  claimedBy?:  User | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface ClaimRequest {
  _id:              string;
  item:             LostFoundItem;
  claimedBy:        User;
  ownerDescription: string;
  proofImageUrl?:   string | null;
  status:           ClaimStatus;
  createdAt:        string;
  updatedAt:        string;
}

export interface ItemFilters {
  status?:   ItemStatus;
  category?: ItemCategory;
  location?: string;
  search?:   string;
  page?:     number;
  limit?:    number;
}

export interface PaginatedItems {
  items: LostFoundItem[];
  total: number;
  page:  number;
  pages: number;
}
