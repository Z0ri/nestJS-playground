import { CommonInterface } from './common.interface';

export interface CartInterface extends CommonInterface {
  userId: number;
  productId: number;
}