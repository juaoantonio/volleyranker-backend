import { Module } from "@nestjs/common";
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from "@nestjs/config";
import { join } from "path";
import Joi from "joi";

type DB_SCHEMA_TYPE = {
  DB_VENDOR: "postgres" | "sqlite";
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
  DB_SYNCHRONIZE?: boolean;
};

type GOOGLE_OAUTH_SCHEMA_TYPE = {
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  GOOGLE_OAUTH_REDIRECT_URI: string;
};

type JWT_SCHEMA_TYPE = {
  JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_JWT_TOKEN_EXPIRES_IN: string;
};

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE &
  GOOGLE_OAUTH_SCHEMA_TYPE &
  JWT_SCHEMA_TYPE;

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid("postgres", "sqlite"),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().when("DB_VENDOR", {
    is: "postgres",
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when("DB_VENDOR", {
    is: "postgres",
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when("DB_VENDOR", {
    is: "postgres",
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().integer().when("DB_VENDOR", {
    is: "postgres",
    then: Joi.required(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
};

export const GOOGLE_OAUTH_SCHEMA: Joi.StrictSchemaMap<GOOGLE_OAUTH_SCHEMA_TYPE> =
  {
    GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
    GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_OAUTH_REDIRECT_URI: Joi.string().required(),
  };

export const JWT_SCHEMA: Joi.StrictSchemaMap<JWT_SCHEMA_TYPE> = {
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  REFRESH_JWT_SECRET: Joi.string().required(),
  REFRESH_JWT_TOKEN_EXPIRES_IN: Joi.string().required(),
};

// https://docs.nestjs.com/modules#dynamic-modules
// https://docs.nestjs.com/techniques/configuration#configuration
@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}) {
    const { envFilePath, ...otherOptions } = options;
    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        ...(Array.isArray(envFilePath) ? envFilePath! : [envFilePath!]),
        join(process.cwd(), "envs", `.env.${process.env.NODE_ENV!}`),
        join(process.cwd(), "envs", `.env`),
      ],
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
        ...GOOGLE_OAUTH_SCHEMA,
        ...JWT_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
