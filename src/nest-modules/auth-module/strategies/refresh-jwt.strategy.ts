import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { CONFIG_SCHEMA_TYPE } from "../../config-module/config.module";
import { AuthJwtPayload } from "../types/auth.jwt-payload";
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "refresh-jwt",
) {
  constructor(
    private readonly configService: ConfigService<CONFIG_SCHEMA_TYPE>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("REFRESH_JWT_SECRET"),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.get("authorization").replace("Bearer ", "").trim();
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
