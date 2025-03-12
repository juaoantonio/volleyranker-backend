import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth/local-auth.guard";

@Controller("auth")
export class AuthController {
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() {
    return "google login";
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleLoginCallback() {}
}
