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

  describe("[GRUPO] - [Modo Normal]", () => {
    it("deve salvar um player", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      const found = await playerRepository.findById(player.getId());
      expect(found).not.toBeNull();
      expect(found.equals(player)).toBe(true);
    });

    it("deve salvar vários players com saveMany", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const allPlayers = await playerRepository.findMany();
      // Verifica se pelo menos 3 players estão presentes (pode haver outros de testes anteriores)
      expect(allPlayers.length).toBe(4);
    });

    it("deve recuperar um player por id (findById)", async () => {
      const found = await playerRepository.findById(defaultPlayer.getId());
      expect(found).not.toBeNull();
      expect(found.equals(defaultPlayer)).toBe(true);
    });

    it("deve recuperar vários players (findMany)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const foundPlayers = await playerRepository.findMany();
      expect(foundPlayers.length).toBe(4);
    });

    it("deve recuperar players por ids (findManyByIds)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const ids = players.map((p) => p.getId());
      const foundPlayers = await playerRepository.findManyByIds(ids);
      expect(foundPlayers.length).toEqual(ids.length);
    });

    it("deve verificar existência de players (existsById)", async () => {
      const players = Player.fake().thePlayers(2).build();
      await playerRepository.saveMany(players);
      const existingIds = players.map((p) => p.getId());
      const randomId = PlayerId.random();
      const { exists, notExists } = await playerRepository.existsById([
        ...existingIds,
        randomId,
      ]);
      expect(exists.length).toEqual(existingIds.length);
      expect(notExists.length).toEqual(1);
      expect(notExists[0].getValue()).toEqual(randomId.getValue());
    });

    it("deve atualizar uma entidade", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      const found = await playerRepository.findById(player.getId());
      expect(found.equals(player)).toBe(true);
      found.changeName("Novo Nome");
      await playerRepository.update(found);
      const updated = await playerRepository.findById(player.getId());
      expect(updated.name).toEqual("Novo Nome");
      expect(updated.equals(found)).toBe(true);
    });

    it("deve deletar uma entidade", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      await playerRepository.delete(player.getId());
      const found = await playerRepository.findById(player.getId());
      expect(found).toBeNull();
    });

    it("deve deletar várias entidades (deleteManyByIds)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const ids = players.map((p) => p.getId());
      await playerRepository.deleteManyByIds(ids);
      for (const id of ids) {
        const found = await playerRepository.findById(id);
        expect(found).toBeNull();
      }
    });
  });

  describe("[GRUPO] - [Modo Transacional]", () => {
    it("deve salvar um player dentro de uma transação (commit)", async () => {
      const player = Player.fake().aPlayer().build();
      await uow.start();
      await playerRepository.save(player);
      await uow.commit();
      const found = await playerRepository.findById(player.getId());
      expect(found).not.toBeNull();
      expect(found.equals(player)).toBe(true);
    });

    it("não deve salvar um player dentro de uma transação (rollback)", async () => {
      const player = Player.fake().aPlayer().build();
      await uow.start();
      await playerRepository.save(player);
      await uow.rollback();
      const found = await playerRepository.findById(player.getId());
      expect(found).toBeNull();
    });

    it("deve salvar vários players com saveMany dentro de uma transação (commit)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await uow.start();
      await playerRepository.saveMany(players);
      await uow.commit();
      const foundPlayers = await playerRepository.findMany();
      expect(foundPlayers.length).toBe(4);
    });

    it("não deve salvar vários players com saveMany dentro de uma transação (rollback)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await uow.start();
      await playerRepository.saveMany(players);
      await uow.rollback();
      const foundPlayers = await playerRepository.findMany();
      // Filtra somente os players que foram gerados no teste (comparando IDs)
      const ids = players.map((p) => p.getId().getValue());
      const filtered = foundPlayers.filter((p) =>
        ids.includes(p.getId().getValue()),
      );
      expect(filtered.length).toEqual(0);
    });

    it("deve atualizar uma entidade dentro de uma transação (commit)", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      const found = await playerRepository.findById(player.getId());
      expect(found.equals(player)).toBe(true);
      found.changeName("Transactional Updated");
      await uow.start();
      await playerRepository.update(found);
      await uow.commit();
      const updated = await playerRepository.findById(player.getId());
      expect(updated.name).toEqual("Transactional Updated");
      expect(updated.equals(found)).toBe(true);
    });

    it("não deve atualizar uma entidade dentro de uma transação (rollback)", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      const found = await playerRepository.findById(player.getId());
      expect(found.equals(player)).toBe(true);
      found.changeName("Transactional Updated");
      await uow.start();
      await playerRepository.update(found);
      await uow.rollback();
      const notUpdated = await playerRepository.findById(player.getId());
      expect(notUpdated.name).not.toEqual("Transactional Updated");
      expect(notUpdated.equals(player)).toBe(true);
    });

    it("deve deletar uma entidade dentro de uma transação (commit)", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      await uow.start();
      await playerRepository.delete(player.getId());
      await uow.commit();
      const found = await playerRepository.findById(player.getId());
      expect(found).toBeNull();
    });

    it("não deve deletar uma entidade dentro de uma transação (rollback)", async () => {
      const player = Player.fake().aPlayer().build();
      await playerRepository.save(player);
      await uow.start();
      await playerRepository.delete(player.getId());
      await uow.rollback();
      const found = await playerRepository.findById(player.getId());
      expect(found).not.toBeNull();
      expect(found.equals(player)).toBe(true);
    });

    it("deve deletar várias entidades com deleteManyByIds dentro de uma transação (commit)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const ids = players.map((p) => p.getId());
      await uow.start();
      await playerRepository.deleteManyByIds(ids);
      await uow.commit();
      for (const id of ids) {
        const found = await playerRepository.findById(id);
        expect(found).toBeNull();
      }
    });

    it("não deve deletar várias entidades com deleteManyByIds dentro de uma transação (rollback)", async () => {
      const players = Player.fake().thePlayers(3).build();
      await playerRepository.saveMany(players);
      const ids = players.map((p) => p.getId());
      await uow.start();
      await playerRepository.deleteManyByIds(ids);
      await uow.rollback();
      for (const id of ids) {
        const found = await playerRepository.findById(id);
        expect(found).not.toBeNull();
      }
    });
  });
});
