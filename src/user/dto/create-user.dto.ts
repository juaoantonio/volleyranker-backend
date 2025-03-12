import { UserRole, UserStatus } from "../entities/user.entity";

export class CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}
