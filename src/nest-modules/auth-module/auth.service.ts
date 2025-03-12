import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import { compare } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthJwtPayload } from "./types/auth.jwt-payload";
import { CONFIG_SCHEMA_TYPE } from "../config-module/config.module";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<CONFIG_SCHEMA_TYPE>,
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
    const access = this.jwtService.sign(payload);
    const refresh = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("REFRESH_JWT_TOKEN_EXPIRES_IN"),
      secret: this.configService.get("REFRESH_JWT_SECRET"),
    });
    return {
      access,
      refresh,
    };
  }

  refreshToken(userId: string, email: string) {
    const payload: AuthJwtPayload = { sub: userId, email };
    const access = this.jwtService.sign(payload);
    return {
      access,
    };
  }
}
