import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  controllers: [AuthController],
  providers: [AuthModule, GoogleStrategy, LocalStrategy],
  exports: [],
})
export class AuthModule {}
