import { CommonInterface } from "./common.interface";

export interface cartItemsInterface extends CommonInterface{
    cartId: number,
    productId: number,
    quantity: number,
}