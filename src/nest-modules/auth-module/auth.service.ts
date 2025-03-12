import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import { compare } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthJwtPayload } from "./types/auth.jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException("User not found!");
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException("Invalid credentials");

    return { id: user.id, email: user.email };
  }

  async login(userId: string, email: string) {
    const payload: AuthJwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
