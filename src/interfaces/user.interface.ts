import { AddressInterface } from './address.interface';
import { CommonInterface } from './common.interface';

export interface UserInterface extends CommonInterface {
  username: string;
  email: string;
  password: string;
  money: number;
  role: string;
  addressId: number;
  address?: AddressInterface;
}
