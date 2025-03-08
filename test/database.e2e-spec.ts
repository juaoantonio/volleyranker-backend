import { Test } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { DatabaseModule } from "../src/nest-modules/database-module/database.module";
import { ConfigModule } from "../src/nest-modules/config-module/config.module";

describe("DatabaseModule Unit Tests", () => {
  describe("SQLite Connection", () => {
    const connOptions = {
      DB_VENDOR: "sqlite",
      DB_HOST: ":memory:",
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: false,
      DB_DATABASE: ":memory:",
      DB_SYNCHRONIZE: true,
    };

    it("should be a sqlite connection", async () => {
      const module = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
          DatabaseModule,
        ],
      }).compile();
      const app = module.createNestApplication();
      const connection = app.get(getDataSourceToken());

      expect(connection).toBeDefined();
      expect(connection.isInitialized).toBe(true);
      expect(connection.options.type).toBe("sqlite");
      expect(connection.options.database).toBe(":memory:");
      expect(connection.options.synchronize).toBe(true);
    });
  });

  describe("PostgreSQL Connection", async () => {
    const container = await new PostgreSqlContainer().start();

    const connOptions = {
      DB_VENDOR: "postgres",
      DB_HOST: container.getHost(),
      DB_PORT: container.getPort(),
      DB_USERNAME: container.getUsername(),
      DB_PASSWORD: container.getPassword(),
      DB_DATABASE: container.getDatabase(),
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: true,
    };

    it("should be a postgres connection", async () => {
      const module = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
          DatabaseModule,
        ],
      }).compile();
      const app = module.createNestApplication();
      const dataSource = app.get(getDataSourceToken());
      const options = dataSource.options as PostgresConnectionOptions;
      expect(dataSource).toBeDefined();
      expect(dataSource.isInitialized).toBe(true);
      expect(options.type).toBe("postgres");
      expect(options.database).toBe(container.getDatabase());
      expect(options.host).toBe(container.getHost());
      expect(options.port).toBe(container.getPort());
      expect(options.username).toBe(container.getUsername());
      expect(options.password).toBe(container.getPassword());
    });
  });
});
