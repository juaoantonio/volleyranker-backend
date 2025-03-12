import { Controller, Get, UseGuards } from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";

@Controller("auth")
export class AuthController {
  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() {
    return "google login";
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleLoginCallback() {}
}
