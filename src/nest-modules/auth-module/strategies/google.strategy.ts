import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CONFIG_SCHEMA_TYPE } from "../../config-module/config.module";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<CONFIG_SCHEMA_TYPE>,
  ) {
    super({
      clientID: configService.get("GOOGLE_OAUTH_CLIENT_ID"),
      clientSecret: configService.get("GOOGLE_OAUTH_CLIENT_SECRET"),
      callbackURL: configService.get("GOOGLE_OAUTH_REDIRECT_URI"),
      passReqToCallback: true,
      scope: ["email", "profile"],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ) {
    return profile;
  }
}
