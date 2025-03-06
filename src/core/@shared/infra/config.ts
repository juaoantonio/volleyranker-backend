export class Config {
  static database() {
    return {
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      logging: false,
    };
  }
}
