import { describe, expect, it } from "vitest";
import { GameParticipant } from "@core/game/domain/game-participant.entity";
import { Player } from "@core/player/domain/player.aggregate";

describe("GameParticipant Entity", () => {
  it("deve criar um GameParticipant com hasPaid padrão como false", () => {
    const participant = GameParticipant.create(
      "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
    );
    expect(participant).toBeInstanceOf(GameParticipant);
    expect(participant.hasPaid).toBe(false);
    expect(participant.playerId.toString()).toBe(
      "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
    );
    expect(participant.getId()).toBeDefined();
  });

  it("deve criar um GameParticipant com hasPaid como true quando especificado", () => {
    const participant = GameParticipant.create(
      "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
      true,
    );
    expect(participant.hasPaid).toBe(true);
  });

  it("deve criar um GameParticipant utilizando um ID customizado", () => {
    const customId = "adea1e76-b23d-4e65-a669-d66f454fad39";
    const participant = GameParticipant.create(
      "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
      false,
      customId,
    );
    expect(participant.getId().toString()).toBe(customId);
  });

  it("deve criar um GameParticipant a partir de um Player utilizando createFromPlayer", () => {
    // Cria um fake Player para o teste
    const fakePlayer = {
      getId: () => ({
        toString: () => "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
      }),
    } as Player;

    const participant = GameParticipant.createFromPlayer(fakePlayer);
    expect(participant).toBeInstanceOf(GameParticipant);
    expect(participant.playerId.toString()).toBe(
      "9836c3ec-d3f7-4aeb-8dde-4afa8f974b66",
    );
    expect(participant.hasPaid).toBe(false);
  });
});
