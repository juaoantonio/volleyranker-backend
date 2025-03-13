import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
}

@Entity({
  name: "users",
})
export class UserModel {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  hashedRefreshToken: string;

  @Column({
    type: "simple-enum",
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: "simple-enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
