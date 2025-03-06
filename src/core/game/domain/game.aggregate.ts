import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { GameValidatorFactory } from "@core/game/domain/game.validator";
import { AgeRange } from "@core/game/domain/age-range.vo";
import { TeamFormat } from "@core/game/domain/team-format.vo";
import { GameSchedule } from "@core/game/domain/game-schedule.vo";
import {
  GameParticipant,
  GameParticipantId,
} from "@core/game/domain/game-participant.entity";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";
import { PlayerId } from "@core/player/domain/player.aggregate";

export class GameId extends Uuid {}

export enum GameSurface {
  BEACH = "Vôlei de praia (areia)",
  COURT = "Vôlei de quadra",
  OTHER = "Outro",
}

export enum GameGender {
  MENS = "Masculino",
  MIXED = "Misto",
  WOMENS = "Feminino",
}

export enum GameIntensity {
  COMPETITIVE = "Competitivo",
  MODERATE = "Moderado",
  CASUAL = "Casual",
}

export class GameType {
  readonly surface: GameSurface;
  readonly teamFormat: TeamFormat;

  constructor(surface: GameSurface, teamFormat: TeamFormat) {
    this.surface = surface;
    this.teamFormat = teamFormat;
  }
}

export interface GameCreationProps {
  id?: string;
  name: string;
  organizerId: string;
  addressLink: string;
  gameSchedule: {
    day: Date;
    startTime: string;
    endTime: string;
  };
  gameType: {
    surface: GameSurface;
    teamFormat: {
      playersPerTeam: number;
      gender: GameGender;
    };
  };
  totalSpots: number; // Número de vagas
  pricePerPerson: number; // Preço por pessoa
  intensity: GameIntensity;
  ageRange: {
    minAge: number;
    maxAge: number;
  };
}

// Agregado Game que incorpora todas as informações do jogo
export class Game extends AggregateRoot<GameId> {
  readonly name: string;
  readonly addressLink: string;
  readonly organizerId: PlayerId;
  readonly schedule: GameSchedule;
  readonly gameType: GameType;
  readonly totalSpots: number;
  readonly pricePerPerson: number;
  readonly intensity: GameIntensity;
  readonly ageRange: AgeRange;

  // Utilizamos um Map para armazenar participantes, onde a chave é o ID do participante.
  private participants: Map<string, GameParticipant> = new Map();

  constructor(props: {
    id: GameId;
    organizerId: PlayerId;
    name: string;
    addressLink: string;
    schedule: GameSchedule;
    gameType: GameType;
    totalSpots: number;
    pricePerPerson: number;
    intensity: GameIntensity;
    ageRange: AgeRange;
  }) {
    super(props.id);
    this.name = props.name;
    this.addressLink = props.addressLink;
    this.schedule = props.schedule;
    this.gameType = props.gameType;
    this.totalSpots = props.totalSpots;
    this.pricePerPerson = props.pricePerPerson;
    this.intensity = props.intensity;
    this.ageRange = props.ageRange;
    this.organizerId = props.organizerId;
    this.participants.set(
      props.organizerId.toString(),
      GameParticipant.create({
        playerId: props.organizerId.toString(),
      }),
    );
  }

  public static create(props: GameCreationProps): Game {
    const id = props.id ? GameId.create(props.id) : (GameId.random() as GameId);
    const teamFormat = new TeamFormat(
      props.gameType.teamFormat.playersPerTeam,
      props.gameType.teamFormat.gender,
    );
    const gameType = new GameType(props.gameType.surface, teamFormat);
    const ageRange = new AgeRange(props.ageRange.minAge, props.ageRange.maxAge);
    const schedule = new GameSchedule(
      props.gameSchedule.day,
      props.gameSchedule.startTime,
      props.gameSchedule.endTime,
    );
    const game = new Game({
      id,
      organizerId: PlayerId.create(props.organizerId),
      name: props.name,
      addressLink: props.addressLink,
      schedule,
      gameType,
      totalSpots: props.totalSpots,
      pricePerPerson: props.pricePerPerson,
      intensity: props.intensity,
      ageRange,
    });
    game.validate();
    return game;
  }

  public markParticipantAsPaid(participantId: GameParticipantId): void {
    const participant = this.participants.get(participantId.toString());
    if (!participant) {
      throw new EntityNotFoundError(GameParticipantId, GameParticipant);
    }
    participant.markAsPaid();
  }

  public getParticipants(): GameParticipant[] {
    return Array.from(this.participants.values());
  }

  public availableSpots(): number {
    return this.totalSpots - this.participants.size;
  }

  public hasAvailableSpots(): boolean {
    return this.availableSpots() > 0;
  }

  public addParticipant(participant: GameParticipant): void {
    if (!this.hasAvailableSpots()) {
      throw new Error("Não há vagas disponíveis para adicionar participantes.");
    }
    const key = participant.getId().toString();
    if (this.participants.has(key)) {
      throw new Error("Participante já adicionado ao jogo.");
    }
    this.participants.set(key, participant);
  }

  /**
   * Remove um participante do jogo a partir do seu ID.
   */
  public removeParticipant(participantId: GameParticipantId): void {
    const key = participantId.toString();
    if (!this.participants.has(key)) {
      throw new EntityNotFoundError(GameParticipantId, GameParticipant);
    }
    this.participants.delete(key);
  }

  validate(fields?: string[]): void {
    const validator = GameValidatorFactory.create();
    validator.validate(this.notification, this, fields);
    if (this.totalSpots <= 0) {
      this.notification.addError(
        "O número de vagas deve ser maior que zero.",
        "totalSpots",
      );
    }
    if (this.totalSpots < this.gameType.teamFormat.playersPerTeam * 2) {
      this.notification.addError(
        "O número de vagas deve ser suficiente para acomodar todos os jogadores.",
        "totalSpots",
      );
    }
  }
}
