import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { CONFIG_SCHEMA_TYPE } from "../../config-module/config.module";
import { AuthJwtPayload } from "../types/auth.jwt-payload";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<CONFIG_SCHEMA_TYPE>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("JWT_SECRET"),
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthJwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
