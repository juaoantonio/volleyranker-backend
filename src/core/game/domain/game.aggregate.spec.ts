// src/game/domain/game.aggregate.spec.ts

import { format } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Game,
  GameCreationProps,
  GameGender,
  GameIntensity,
  GameSurface,
} from "@core/game/domain/game.aggregate";
import { GameParticipant } from "@core/game/domain/game-participant.entity";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";

describe("[UNITÁRIO] - [Game] - [Suite de testes para Game]", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Define a data atual como 01/01/2024 03:00:00Z para testes consistentes
    vi.setSystemTime(new Date("2024-01-01T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Datas base para os testes
  const now = Date.now();
  const tomorrow = new Date(now + 24 * 60 * 60 * 1000); // amanhã
  // Cria objetos Date para horário de início e término (considerando o mesmo dia 'tomorrow')
  const startDate = new Date(tomorrow.getTime() + 3600000); // 1 hora depois de 'tomorrow'
  const endDate = new Date(tomorrow.getTime() + 7200000); // 2 horas depois de 'tomorrow'

  const validGameProps: GameCreationProps = {
    name: "Jogo de Vôlei",
    addressLink: "http://example.com",
    organizerId: Uuid.random().toString(),
    gameSchedule: {
      day: tomorrow,
      startTime: format(startDate, "HH:mm"),
      endTime: format(endDate, "HH:mm"),
    },
    gameType: {
      surface: GameSurface.BEACH,
      teamFormat: {
        playersPerTeam: 3, // opção válida (3x3)
        gender: GameGender.MENS,
      },
    },
    totalSpots: 6, // exatamente o necessário para 2 times de 3 jogadores
    pricePerPerson: 50,
    intensity: GameIntensity.MODERATE,
    ageRange: {
      minAge: 18,
      maxAge: 35,
    },
  };

  describe("[GRUPO] - [Criação do Game]", () => {
    it("deve criar uma instância de Game com ID aleatório quando nenhum ID for fornecido", () => {
      const game = Game.create(validGameProps);
      expect(game).toBeInstanceOf(Game);
      expect(game.name).toBe(validGameProps.name);
      expect(game.addressLink).toBe(validGameProps.addressLink);
      expect(game.getId()).toBeDefined();
    });

    it("deve criar uma instância de Game utilizando o ID fornecido", () => {
      const customId = "123e4567-e89b-12d3-a456-426614174000";
      const propsWithId: GameCreationProps = {
        ...validGameProps,
        id: customId,
      };
      const game = Game.create(propsWithId);
      expect(game.getId().toString()).toBe(customId);
    });
  });

  describe("[GRUPO] - [Validação do Game]", () => {
    it("deve adicionar erro na notification se o número de vagas for zero ou negativo", () => {
      const propsInvalidSpots: GameCreationProps = {
        ...validGameProps,
        totalSpots: 0,
      };
      const game = Game.create(propsInvalidSpots);
      expect(game.notification.hasErrors()).toBe(true);
      expect(game.notification).notificationContainsErrorMessages([
        {
          totalSpots: [
            "O número de vagas deve ser maior que zero.",
            "O número de vagas deve ser suficiente para acomodar todos os jogadores.",
          ],
        },
      ]);
    });

    it("deve adicionar erro na notification se o número de vagas for insuficiente para acomodar todos os jogadores", () => {
      // Para teamFormat com 3 jogadores por time, o mínimo é 6 vagas; aqui usamos 5
      const propsInsufficientSpots: GameCreationProps = {
        ...validGameProps,
        totalSpots: 5,
      };
      const game = Game.create(propsInsufficientSpots);
      expect(game.notification.hasErrors()).toBe(true);
      expect(game.notification).notificationContainsErrorMessages([
        {
          totalSpots: [
            "O número de vagas deve ser suficiente para acomodar todos os jogadores.",
          ],
        },
      ]);
    });

    it("deve adicionar erro na notification se o nome do jogo for vazio", () => {
      const propsEmptyName: GameCreationProps = {
        ...validGameProps,
        name: "   ",
      };
      const game = Game.create(propsEmptyName);
      expect(game.notification.hasErrors()).toBe(true);
      expect(game.notification).notificationContainsErrorMessages([
        { name: ["Não deve ter somente espaços"] },
      ]);
    });

    it("deve adicionar erro na notification se o nome do jogo possuir menos de 3 caracteres", () => {
      const propsEmptyName: GameCreationProps = {
        ...validGameProps,
        name: "ab",
      };
      const game = Game.create(propsEmptyName);
      expect(game.notification.hasErrors()).toBe(true);
      expect(game.notification).notificationContainsErrorMessages([
        {
          name: ["Deve ser maior ou igual a 3"],
        },
      ]);
    });

    it("deve adicionar erro na notification se o link do endereço for vazio", () => {
      const propsEmptyAddress: GameCreationProps = {
        ...validGameProps,
        addressLink: "",
      };
      const game = Game.create(propsEmptyAddress);
      expect(game.notification.hasErrors()).toBe(true);
      expect(game.notification).notificationContainsErrorMessages([
        { addressLink: ["Deve ser uma URL válida"] },
      ]);
    });

    it("deve lançar exceção se o horário de início for igual ao horário de término", () => {
      const propsInvalidSchedule: GameCreationProps = {
        ...validGameProps,
        gameSchedule: {
          day: tomorrow,
          startTime: format(startDate, "HH:mm"),
          endTime: format(startDate, "HH:mm"), // mesmo horário para início e término
        },
      };
      expect(() => Game.create(propsInvalidSchedule)).toThrowError(
        "O horário de início deve ser anterior ao horário de término.",
      );
    });
  });

  describe("[GRUPO] - [Participantes]", () => {
    it("deve retornar o número correto de vagas disponíveis inicialmente", () => {
      const game = Game.create(validGameProps);
      expect(game.availableSpots()).toBe(validGameProps.totalSpots);
      expect(game.hasAvailableSpots()).toBe(true);
    });

    it("deve permitir adicionar um participante se houver vagas disponíveis", () => {
      const game = Game.create(validGameProps);
      const participant = GameParticipant.create(
        "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
      );
      game.addParticipant(participant);
      expect(game.getParticipants().length).toBe(1);
      expect(game.availableSpots()).toBe(validGameProps.totalSpots - 1);
    });

    it("deve lançar erro ao tentar adicionar um participante se não houver vagas disponíveis", () => {
      const game = Game.create(validGameProps);
      // Preenche todas as vagas
      for (let i = 0; i < validGameProps.totalSpots; i++) {
        game.addParticipant(
          GameParticipant.create(`${i}836c3ec-d3f7-4aeb-8dde-4afa8f974b66`),
        );
      }
      expect(game.availableSpots()).toBe(0);
      expect(game.hasAvailableSpots()).toBe(false);
      expect(() =>
        game.addParticipant(
          GameParticipant.create("9836c3ec-d3f7-4aeb-8dde-4afa8f974b66"),
        ),
      ).toThrowError("Não há vagas disponíveis para adicionar participantes.");
    });
  });
});
