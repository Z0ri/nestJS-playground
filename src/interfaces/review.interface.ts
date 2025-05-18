import { CommonInterface } from './common.interface';

export interface ReviewInterface extends CommonInterface {
  productId: number;
  authorId: number;
  rating: number;
  comment?: string;
  created_at: Date;
}