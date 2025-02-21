// src/volley-group/domain/volley-group.aggregate.spec.ts

import { describe, expect, it } from "vitest";
import { PlayerId } from "@core/player/domain/player.aggregate";
import { GameId } from "@core/game/domain/game.aggregate";
import { AlreadyMemberError } from "@core/volleygroup/domain/already-member.error";
import { OwnerRemovalError } from "@core/volleygroup/domain/owner-removal.error";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import {
  VolleyGroup,
  VolleyGroupCreationProps,
} from "@core/volleygroup/domain/volleygroup.aggregate";

describe("[UNITÁRIO] - [VolleyGroup] - [Suite de testes para VolleyGroup]", () => {
  describe("[GRUPO] - [Criação do VolleyGroup]", () => {
    it("deve criar uma instância de VolleyGroup com ID aleatório quando nenhum ID for fornecido", () => {
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei Teste",
        description: "Grupo para jogos informais",
        ownerId: Uuid.random().toString(),
      };

      const group = VolleyGroup.create(props);
      expect(group).toBeInstanceOf(VolleyGroup);
      expect(group.getMembers().length).toBe(1);
      // Verifica que o único membro é o proprietário
      expect(group.getMembers()[0].toString()).toBe(
        PlayerId.create(props.ownerId).toString(),
      );
    });

    it("deve criar uma instância de VolleyGroup utilizando o ID fornecido", () => {
      const customId = "123e4567-e89b-12d3-a456-426614174000";
      const props: VolleyGroupCreationProps = {
        id: customId,
        name: "Grupo Customizado",
        description: "Grupo com ID customizado",
        ownerId: Uuid.random().toString(),
      };
      const group = VolleyGroup.create(props);
      expect(group.getId().toString()).toBe(customId);
    });
  });

  describe("[GRUPO] - [Gerenciamento de Membros]", () => {
    it("deve adicionar um novo membro ao grupo", () => {
      const ownerId = Uuid.random().toString();
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId,
      };
      const group = VolleyGroup.create(props);
      const newMember = PlayerId.create(Uuid.random().toString());
      group.addMember(newMember);
      const members = group.getMembers();
      expect(members.length).toBe(2);
      expect(members.map((m) => m.toString())).toContain(newMember.toString());
    });

    it("deve lançar AlreadyMemberError ao tentar adicionar um membro já existente", () => {
      const ownerId = Uuid.random().toString();
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId,
      };
      const group = VolleyGroup.create(props);
      const owner = PlayerId.create(ownerId);
      expect(() => group.addMember(owner)).toThrowError(AlreadyMemberError);
    });

    it("deve remover um membro que não seja o proprietário", () => {
      const ownerId = Uuid.random().toString();
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId,
      };
      const group = VolleyGroup.create(props);
      const newMember = PlayerId.create(Uuid.random().toString());
      group.addMember(newMember);
      expect(group.getMembers().length).toBe(2);
      group.removeMember(newMember);
      const members = group.getMembers();
      expect(members.length).toBe(1);
      expect(members.map((m) => m.toString())).not.toContain(
        newMember.toString(),
      );
    });

    it("deve lançar OwnerRemovalError ao tentar remover o proprietário do grupo", () => {
      const ownerId = Uuid.random().toString();
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId,
      };
      const group = VolleyGroup.create(props);
      const owner = PlayerId.create(ownerId);
      expect(() => group.removeMember(owner)).toThrowError(OwnerRemovalError);
    });
  });

  describe("[GRUPO] - [Gerenciamento de Jogos]", () => {
    it("deve adicionar um jogo ao grupo", () => {
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId: Uuid.random().toString(),
      };
      const group = VolleyGroup.create(props);
      const gameId = GameId.create(Uuid.random().toString());
      group.addGame(gameId);
      const games = group.getGames();
      expect(games.length).toBe(1);
      expect(games.map((g) => g.toString())).toContain(gameId.toString());
    });

    it("não deve adicionar o mesmo jogo mais de uma vez", () => {
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId: Uuid.random().toString(),
      };
      const group = VolleyGroup.create(props);
      const gameId = GameId.create(Uuid.random().toString());
      group.addGame(gameId);
      group.addGame(gameId); // tentativa de adição duplicada
      const games = group.getGames();
      expect(games.length).toBe(1);
    });

    it("deve remover um jogo do grupo", () => {
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId: Uuid.random().toString(),
      };
      const group = VolleyGroup.create(props);
      const gameId = GameId.create(Uuid.random().toString());
      group.addGame(gameId);
      expect(group.getGames()).toContainEqual(gameId);
      group.removeGame(gameId);
      expect(group.getGames()).not.toContainEqual(gameId);
    });

    it("deve lançar EntityNotFoundError ao tentar remover um jogo que não existe", () => {
      const props: VolleyGroupCreationProps = {
        name: "Grupo de Vôlei",
        description: "Descrição",
        ownerId: Uuid.random().toString(),
      };
      const group = VolleyGroup.create(props);
      const randomGameId = GameId.create(Uuid.random().toString());
      expect(() => group.removeGame(randomGameId)).toThrowError(
        EntityNotFoundError,
      );
    });
  });
});
