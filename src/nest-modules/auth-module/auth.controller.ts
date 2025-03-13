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
import { RefreshAuthGuard } from "./guards/refresh-auth/refresh-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req: LocalAuthRequest) {
    return this.authService.login(req.user.id, req.user.email);
  }

  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id, req.user.email);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post("signout")
  async signOut(@Req() req) {
    return this.authService.signOut(req.user.id);
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleLoginCallback() {}
}
