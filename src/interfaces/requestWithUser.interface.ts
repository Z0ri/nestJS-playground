import { Role } from 'src/enum/Roles';
import { UserInterface } from './user.interface';

export interface RequestWithUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}
