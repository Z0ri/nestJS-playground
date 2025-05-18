import { CommonInterface } from './common.interface';

export interface CompanyInterface extends CommonInterface {
  name: string;
  location?: string;
  founded_year?: Date;
}