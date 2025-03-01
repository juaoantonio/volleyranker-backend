import { Player, PlayerId } from "@core/player/domain/player.aggregate";

describe("[UNITÁRIO] - [Player] - [Suite de testes para Player]", () => {
  describe("[GRUPO] - [Criação do Player]", () => {
    it("deve criar uma instância de Player com ID aleatório quando nenhum ID for fornecido", () => {
      const props = {
        userId: "9b6fb193-479d-45cf-8962-f158c2460b17",
        name: "Jogador Teste",
        attackStat: 80,
        defenseStat: 70,
        setStat: 75,
        serviceStat: 85,
        blockStat: 90,
        receptionStat: 65,
        positioningStat: 80,
        consistencyStat: 77,
      };

      const player = Player.create(props);

      expect(player).toBeInstanceOf(Player);
      expect(player.userId).toBe(props.userId);
      expect(player.name).toBe(props.name);
      expect(player.getId()).toBeDefined();
      expect(player.notification.hasErrors()).toBe(false);
    });

    it("deve criar uma instância de Player utilizando o ID fornecido", () => {
      const customId = "9b6fb193-479d-45cf-8962-f158c2460b07";
      const props = {
        id: customId,
        userId: "9b6fb193-479d-45cf-8962-f158c2460b09",
        name: "Jogador com ID customizado",
        attackStat: 75,
        defenseStat: 70,
        setStat: 80,
        serviceStat: 85,
        blockStat: 65,
        receptionStat: 70,
        positioningStat: 80,
        consistencyStat: 90,
      };
      const player = Player.create(props);
      expect(player.getId().toString()).toBe(customId);
      expect(player.notification.hasErrors()).toBe(false);
    });
  });

  describe("[GRUPO] - [Cálculo do Overall]", () => {
    describe("[CENÁRIO] - [Stats Balanceados]", () => {
      it("deve calcular o overall corretamente para estatísticas balanceadas", () => {
        const stats = {
          attackStat: 80,
          defenseStat: 80,
          setStat: 80,
          serviceStat: 80,
          blockStat: 80,
          receptionStat: 80,
          positioningStat: 80,
          consistencyStat: 80,
        };
        const props = {
          userId: "user789",
          name: "Jogador Balanceado",
          ...stats,
        };

        const player = new Player({
          id: PlayerId.random(),
          ...props,
        });
        expect(player.calculateOverall()).toBe(82);
        expect(player.notification.hasErrors()).toBe(false);
      });
    });

    describe("[CENÁRIO] - [Stats Desequilibrados]", () => {
      it("deve calcular o overall corretamente para estatísticas desequilibradas", () => {
        const stats = {
          attackStat: 90,
          serviceStat: 90,
          setStat: 90,
          defenseStat: 70,
          blockStat: 70,
          receptionStat: 70,
          positioningStat: 70,
          consistencyStat: 70,
        };
        const props = {
          userId: "user101",
          name: "Jogador Desequilibrado",
          ...stats,
        };
        const player = new Player({
          id: PlayerId.random(),
          ...props,
        });
        expect(player.calculateOverall()).toBe(78);
        expect(player.notification.hasErrors()).toBe(false);
      });
    });

    describe("[CENÁRIO] - [Máximo Overall]", () => {
      it("deve limitar o overall ao valor máximo definido quando a pontuação ultrapassar OVERALL_MAX", () => {
        const stats = {
          attackStat: 120,
          defenseStat: 120,
          setStat: 120,
          serviceStat: 120,
          blockStat: 120,
          receptionStat: 120,
          positioningStat: 120,
          consistencyStat: 120,
        };
        const props = {
          userId: "user202",
          name: "Jogador com Stats Altas",
          ...stats,
        };

        const player = new Player({
          id: PlayerId.random(),
          ...props,
        });

        // Cálculos:
        // baseScore = 120 * (soma dos pesos = 1) = 120
        // stdev = 0, bonus = 0.2, advancedScore = 120.2
        // overall = Math.min(OVERALL_MAX, advancedScore) = 100 --> Math.round(100) = 100
        expect(player.calculateOverall()).toBe(100);
      });
    });
  });

  describe("[GRUPO] - [Validação de Player]", () => {
    it("deve validar um Player com todas as estatísticas dentro dos limites", () => {
      const stats = {
        attackStat: 80,
        defenseStat: 70,
        setStat: 75,
        serviceStat: 85,
        blockStat: 90,
        receptionStat: 65,
        positioningStat: 80,
        consistencyStat: 77,
      };
      const props = {
        userId: "9b6fb193-479d-45cf-8962-f158c2460b08",
        name: "Jogador Teste",
        ...stats,
      };

      const player = Player.create(props);
      player.validate();

      expect(player.notification.hasErrors()).toBe(false);
    });

    it("deve retornar erros de validação para estatísticas fora dos limites", () => {
      const stats = {
        attackStat: 110,
        defenseStat: 70,
        setStat: 75,
        serviceStat: 85,
        blockStat: 90,
        receptionStat: 65,
        positioningStat: 80,
        consistencyStat: -1,
      };
      const props = {
        userId: "user123",
        name: "Jogador Teste",
        ...stats,
      };

      const player = new Player({
        id: PlayerId.random(),
        ...props,
      });
      player.validate();

      expect(player.notification.hasErrors()).toBe(true);
      expect(player.notification).notificationContainsErrorMessages([
        {
          attackStat: ["Deve ser menor ou igual a 100"],
          consistencyStat: ["Deve ser maior ou igual a 0"],
        },
      ]);
    });

    it("deve retornar erros de validação para player com nome com menos de 3 caracteres", () => {
      const player = Player.create({
        name: "",
        userId: "9b6fb193-479d-45cf-8962-f158c2460b07",
      });
      expect(player.notification.hasErrors()).toBe(true);
      expect(player.notification).notificationContainsErrorMessages([
        {
          _name: [
            "Não deve estar em branco",
            "Deve ter no mínimo 3 caracteres",
          ],
        },
      ]);
    });
  });
});
