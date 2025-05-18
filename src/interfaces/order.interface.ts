import { CommonInterface } from "./common.interface";

export interface OrderInterface extends CommonInterface {
  companyId: number;
  cartId: number;
  productId: number;
  delivery_addressId: number;
  expectedDeliveryDate?: Date;
  statusId: number;
}