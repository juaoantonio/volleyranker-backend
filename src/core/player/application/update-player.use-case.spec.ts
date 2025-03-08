import { InMemoryRepository } from "@core/@shared/infra/db/in-memory/in-memory-repository";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { UpdatePlayerUseCase } from "@core/player/application/update-player.use-case";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";

class StubPlayerRepository extends InMemoryRepository<PlayerId, Player> {
  getEntity() {
    return Player;
  }
}

describe("[UNITÁRIO] - [UpdatePlayerUseCase] - [Suite de testes para UpdatePlayerUseCase]", () => {
  let repository: StubPlayerRepository;
  let updatePlayerUseCase: UpdatePlayerUseCase;

  beforeEach(async () => {
    repository = new StubPlayerRepository();
    updatePlayerUseCase = new UpdatePlayerUseCase(repository);
    await repository.save(
      Player.fake()
        .aPlayer()
        .withId(PlayerId.create("9b6fb193-479d-45cf-8962-f158c2460b07"))
        .build(),
    );
  });

  it("deve atualizar o nome de um Player", async () => {
    await updatePlayerUseCase.execute({
      id: "9b6fb193-479d-45cf-8962-f158c2460b07",
      name: "Jogador Atualizado",
    });
    const repoData = await repository.findMany();
    expect(repoData.length).toBe(1);
    const updatedPlayer = repoData[0];
    expect(updatedPlayer.name).toBe("Jogador Atualizado");
  });

  it("deve lançar uma exceção ao tentar atualizar um Player inexistente", async () => {
    await expect(async () => {
      await updatePlayerUseCase.execute({
        id: "9b6fb193-479d-45cf-8962-f158c2460b08",
        name: "Jogador Atualizado",
      });
    }).rejects.toThrowError(EntityNotFoundError);
  });
});
