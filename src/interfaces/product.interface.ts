import { CommonInterface } from "./common.interface";

export interface ProductInterface extends CommonInterface {
  title: string;
  price: number;
  description?: string;
  image?: string;
  quantity: number;
  categoryId: number;
  companyId: number;
}