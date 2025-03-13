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
import { UserModule } from "./user/user.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh-jwt.strategy";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "./guards/roles/roles.guard";

@Module({
  controllers: [AuthController],

  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        return {
          secret: configService.get("JWT_SECRET"),
          signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN") },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
