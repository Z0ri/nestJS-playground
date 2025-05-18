import { CommonInterface } from './common.interface';

export interface PurchaseInterface extends CommonInterface {
  userId: number;
  productId: number;
  moneyAmount: number;
}