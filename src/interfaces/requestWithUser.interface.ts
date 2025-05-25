import { RoleEnum } from "src/enum/Roles";

export interface RequestWithUser {
  id: number;
  key: string;
  username: string;
  email: string;
  role: RoleEnum;
}
