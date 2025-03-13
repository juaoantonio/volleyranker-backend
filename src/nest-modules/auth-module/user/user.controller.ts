import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../guards/jwt-auth/jwt-auth.guard";
import { Roles } from "../decorators/role.decorator";
import { Role } from "../enums/role.enum";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    await this.userService.remove(id);
  }
}
