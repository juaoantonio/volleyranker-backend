import { InMemoryRepository } from "@core/@shared/infra/db/in-memory/in-memory-repository";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { CreatePlayerUseCase } from "@core/player/application/create-player.use-case";

class StubPlayerRepository extends InMemoryRepository<PlayerId, Player> {
  getEntity() {
    return Player;
  }
}

describe("[UNITÁRIO] - [CreatePlayerUseCase] - [Suite de testes para CreatePlayerUseCase]", () => {
  let repository: StubPlayerRepository;
  let createPlayerUseCase: CreatePlayerUseCase;

  beforeEach(() => {
    repository = new StubPlayerRepository();
    createPlayerUseCase = new CreatePlayerUseCase(repository);
  });

  it("deve criar e persistir um Player válido", async () => {
    await createPlayerUseCase.execute({
      name: "Jogador",
      userId: "2b610e86-d695-487b-9786-9797d46dd4db",
    });
    const repoData = await repository.findMany();
    expect(repoData.length).toBe(1);
    const savedPlayer = repoData[0];
    expect(savedPlayer.name).toBe("Jogador");
    expect(savedPlayer.getId()).toBeDefined();
    expect(savedPlayer.userId).toBe("2b610e86-d695-487b-9786-9797d46dd4db");
  });

  it("deve lançar uma exceção ao tentar criar um Player com nome inválido", async () => {
    expect(async () => {
      await createPlayerUseCase.execute({
        name: "jo", // nome inválido
        userId: "9b6fb193-479d-45cf-8962-f158c2460b07", // uuid inválido
      });
    }).rejects.toThrowError();
  });

  it("deve lançar uma exceção ao tentar criar um Player com userId inválido", async () => {
    expect(async () => {
      await createPlayerUseCase.execute({
        name: "Jogador", // nome válido
        userId: "9b6fb193-479d-45cf-8962-f158c2460b0", // uuid inválido
      });
    }).rejects.toThrowError();
  });
});
