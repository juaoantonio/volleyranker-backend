import { afterAll, beforeAll, expect, it } from "vitest";
import { Client } from "pg";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;
let postgresClient: Client;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  postgresClient = new Client({
    connectionString: container.getConnectionUri(),
  });
  await postgresClient.connect();
});

afterAll(async () => {
  await postgresClient.end();
  await container.stop();
});

it("should connect and execute query", async () => {
  const { rows } = await postgresClient.query("SELECT 1 + 1 AS solution");
  expect(rows[0].solution).toBe(2);
});
