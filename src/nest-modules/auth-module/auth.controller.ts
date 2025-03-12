import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth/local-auth.guard";
import { AuthService } from "./auth.service";
import { LocalAuthRequest } from "./types/local-auth.request";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req: LocalAuthRequest) {
    return this.authService.login(req.user.id, req.user.email);
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleLoginCallback() {}
}
