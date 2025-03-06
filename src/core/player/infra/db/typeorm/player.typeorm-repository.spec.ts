import { PlayerTypeormRepository } from "@core/player/infra/db/typeorm/player.typeorm-repository";
import { setupTypeOrmForIntegrationTests } from "@core/@shared/infra/testing/helpers";
import { PlayerModel } from "@core/player/infra/db/typeorm/player.model";
import { PlayerModelMapper } from "@core/player/infra/db/typeorm/player.model-mapper";
import { PlayerId } from "@core/player/domain/player.aggregate";
import { UnitOfWorkTypeORM } from "@core/@shared/infra/db/unit-of-work.typeorm";

describe("[INTEGRAÇÃO] - [PlayerTypeormRepository] - Suíte de testes do PlayerTypeormRepository", () => {
  let playerRepository: PlayerTypeormRepository;
  const setup = setupTypeOrmForIntegrationTests({
    entities: [PlayerModel],
  });

  beforeEach(() => {
    playerRepository = new PlayerTypeormRepository(
      setup.dataSource.getRepository(PlayerModel),
      new PlayerModelMapper(),
      PlayerId,
      new UnitOfWorkTypeORM(setup.dataSource),
    );
  });

  afterAll(async () => {
    await setup.dataSource.destroy();
  });
});
