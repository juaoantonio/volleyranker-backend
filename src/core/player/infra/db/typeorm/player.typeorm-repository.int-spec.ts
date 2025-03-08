import { PlayerTypeormRepository } from "@core/player/infra/db/typeorm/player.typeorm-repository";
import { setupTypeOrmForIntegrationTests } from "@core/@shared/infra/testing/helpers";
import { PlayerModel } from "@core/player/infra/db/typeorm/player.model";
import { PlayerModelMapper } from "@core/player/infra/db/typeorm/player.model-mapper";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { UnitOfWorkTypeORM } from "@core/@shared/infra/db/unit-of-work.typeorm";

describe("[INTEGRAÇÃO] - [PlayerTypeormRepository] - Suíte de testes do PlayerTypeormRepository", () => {
  let uow: UnitOfWorkTypeORM;
  let playerRepository: PlayerTypeormRepository;
  const setup = setupTypeOrmForIntegrationTests({
    entities: [PlayerModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkTypeORM(setup.dataSource);
    playerRepository = new PlayerTypeormRepository(
      setup.dataSource.getRepository(PlayerModel),
      new PlayerModelMapper(),
      PlayerId,
      uow,
    );
  });

  it("deve persistir uma entidade", async () => {
    const player = Player.fake().aPlayer().build();
    await uow.start();
    await playerRepository.save(player);
    await uow.commit();
    const result = await playerRepository.findById(player.getId());
    expect(result.equals(player)).toBe(true);
  });

  afterAll(async () => {
    await setup.dataSource.destroy();
  });
});
