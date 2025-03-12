import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, AuthModule],
  exports: [],
})
export class AuthModule {}
