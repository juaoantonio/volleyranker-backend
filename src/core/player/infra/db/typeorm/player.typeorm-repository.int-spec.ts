import { PlayerTypeormRepository } from "@core/player/infra/db/typeorm/player.typeorm-repository";
import { setupTypeOrmForIntegrationTests } from "@core/@shared/infra/testing/helpers";
import { PlayerModel } from "@core/player/infra/db/typeorm/player.model";
import { PlayerModelMapper } from "@core/player/infra/db/typeorm/player.model-mapper";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { UnitOfWorkTypeORM } from "@core/@shared/infra/db/unit-of-work.typeorm";

describe("[INTEGRAÇÃO] - [PlayerTypeormRepository] - Suíte de testes", () => {
  const defaultPlayer = Player.fake().aPlayer().build();

  let uow: UnitOfWorkTypeORM;
  let playerRepository: PlayerTypeormRepository;
  const setup = setupTypeOrmForIntegrationTests({
    logging: true,
    entities: [PlayerModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkTypeORM(setup.dataSource);
    playerRepository = new PlayerTypeormRepository(
      setup.dataSource.getRepository(PlayerModel),
      new PlayerModelMapper(),
      PlayerId,
      uow,
    );
    await playerRepository.save(defaultPlayer);
  });

  afterAll(async () => {
    await setup.dataSource.destroy();
  });

  it("deve retornar a entidade Player", () => {
    expect(playerRepository.getEntity()).toBe(Player);
  });
});
