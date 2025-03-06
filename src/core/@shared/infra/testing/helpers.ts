import { DataSource, DataSourceOptions } from "typeorm";
import { Config } from "@core/@shared/infra/config";

export function setupTypeOrmForIntegrationTests(
  options?: Partial<DataSourceOptions>,
) {
  let _dataSource: DataSource;

  beforeAll(async () => {
    _dataSource = new DataSource({
      ...(Config.database() as any),
      ...options,
    });
    await _dataSource.initialize();
  });

  beforeEach(async () => {
    await _dataSource.synchronize(true);
  });

  afterAll(async () => {
    if (_dataSource.isInitialized) await _dataSource.destroy();
  });

  return {
    get dataSource() {
      return _dataSource;
    },
  };
}
