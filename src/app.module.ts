import { Module } from "@nestjs/common";
import { DatabaseModule } from "./nest-modules/database-module/database.module";
import { ConfigModule } from "./nest-modules/config-module/config.module";
import { AuthModule } from "./nest-modules/auth-module/auth.module";
import { UserModule } from "./nest-modules/auth-module/user/user.module";

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, AuthModule, UserModule],
})
export class AppModule {}
