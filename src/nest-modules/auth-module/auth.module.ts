import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import {
  CONFIG_SCHEMA_TYPE,
  ConfigModule,
} from "../config-module/config.module";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { UserModule } from "../../user/user.module";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, LocalStrategy, JwtStrategy],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
})
export class AuthModule {}
