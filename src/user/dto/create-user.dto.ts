import { UserRole, UserStatus } from "../entities/user.entity";

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}
