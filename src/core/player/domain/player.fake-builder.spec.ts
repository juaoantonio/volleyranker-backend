import { Player } from "@core/player/domain/player.aggregate";
import { PlayerFakeBuilder } from "@core/player/domain/player.fake-builder";

describe("[UNITÁRIO] - [PlayerFakeBuilder] - [Suite de testes para PlayerFakeBuilder]", () => {
  describe("[GRUPO] - [Criação do Player com Fake Builder]", () => {
    it("deve criar uma instância de Player com dados padrão", () => {
      const player = PlayerFakeBuilder.aPlayer().build();

      expect(player).toBeInstanceOf(Player);
      expect(player.getId()).toBeDefined();
      expect(player.notification.hasErrors()).toBe(false);
    });

    it("deve criar uma instância de Player utilizando valores customizados", () => {
      const customName = "Jogador Customizado";
      const customUserId = "userCustom";
      const customAttackStat = 95;

      const player = PlayerFakeBuilder.aPlayer()
        .withName(customName)
        .withUserId(customUserId)
        .withAttackStat(customAttackStat)
        .build();

      expect(player).toBeInstanceOf(Player);
      expect(player.name).toBe(customName);
      expect(player.userId).toBe(customUserId);
      expect(player.attackStat).toBe(customAttackStat);
      expect(player.notification.hasErrors()).toBe(false);
    });

    it("deve criar múltiplas instâncias de Player com dados padrão", () => {
      const players = PlayerFakeBuilder.thePlayers(3).build();

      expect(Array.isArray(players)).toBe(true);
      expect(players).toHaveLength(3);
      players.forEach((player) => {
        expect(player).toBeInstanceOf(Player);
        expect(player.getId()).toBeDefined();
        expect(player.notification.hasErrors()).toBe(false);
      });
    });
  });

  describe("[GRUPO] - [Cálculo do Overall com Fake Builder]", () => {
    it("deve calcular o overall corretamente para um Player com estatísticas balanceadas", () => {
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

      const player = PlayerFakeBuilder.aPlayer()
        .withAttackStat(stats.attackStat)
        .withDefenseStat(stats.defenseStat)
        .withSetStat(stats.setStat)
        .withServiceStat(stats.serviceStat)
        .withBlockStat(stats.blockStat)
        .withReceptionStat(stats.receptionStat)
        .withPositioningStat(stats.positioningStat)
        .withConsistencyStat(stats.consistencyStat)
        .build();

      // Conforme os testes do Player, espera-se um overall de 82 para stats balanceadas
      expect(player.calculateOverall()).toBe(82);
    });
  });

  describe("[GRUPO] - [Validação de Player com Fake Builder]", () => {
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

      const player = PlayerFakeBuilder.aPlayer()
        .withAttackStat(stats.attackStat)
        .withDefenseStat(stats.defenseStat)
        .withSetStat(stats.setStat)
        .withServiceStat(stats.serviceStat)
        .withBlockStat(stats.blockStat)
        .withReceptionStat(stats.receptionStat)
        .withPositioningStat(stats.positioningStat)
        .withConsistencyStat(stats.consistencyStat)
        .build();

      player.validate();

      expect(player.notification.hasErrors()).toBe(true);
      expect(player.notification).notificationContainsErrorMessages([
        {
          attackStat: ["Deve ser menor ou igual a 100"],
          consistencyStat: ["Deve ser maior ou igual a 0"],
        },
      ]);
    });
  });
});
