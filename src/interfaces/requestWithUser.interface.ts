import { UserInterface } from './user.interface';

export interface RequestWithUser extends Request {
  user: UserInterface;
}
