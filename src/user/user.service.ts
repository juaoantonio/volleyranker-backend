import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserModel } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private userRepository: Repository<UserModel>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    return this.userRepository.update(userId, { hashedRefreshToken });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ["id", "email", "status", "role", "hashedRefreshToken"],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
