import { RoleEnum } from "src/enum/Roles";

export interface RequestWithUser {
  id: number;
  username: string;
  email: string;
  role: RoleEnum;
}
