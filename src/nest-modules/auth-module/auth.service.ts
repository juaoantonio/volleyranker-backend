import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user/user.service";
import { compare } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthJwtPayload } from "./types/auth.jwt-payload";
import { CONFIG_SCHEMA_TYPE } from "../config-module/config.module";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";

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
    const { access, refresh } = await this.generateTokens(userId, email);
    const hashedRefreshToken = await argon2.hash(refresh);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      access,
      refresh,
    };
  }

  async generateTokens(userId: string, email: string) {
    const payload: AuthJwtPayload = { sub: userId, email };
    const [access, refresh] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get("REFRESH_JWT_TOKEN_EXPIRES_IN"),
        secret: this.configService.get("REFRESH_JWT_SECRET"),
      }),
    ]);
    return {
      access,
      refresh,
    };
  }

  async refreshToken(userId: string, email: string) {
    const { access, refresh } = await this.generateTokens(userId, email);
    const hashedRefreshToken = await argon2.hash(refresh);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      access,
      refresh,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException("Invalid refresh token");
    const refreshTokenMatch = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatch)
      throw new UnauthorizedException("Invalid refresh token");
    return { id: userId, email: user.email };
  }

  async signOut(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }
}
