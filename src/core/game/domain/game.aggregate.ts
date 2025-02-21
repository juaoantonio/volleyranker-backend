import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { GameValidatorFactory } from "@core/game/domain/game.validator";
import { AgeRange } from "@core/game/domain/age-range.vo";
import { TeamFormat } from "@core/game/domain/team-format.vo";
import { GameSchedule } from "@core/game/domain/game-schedule.vo";
import { GameParticipant } from "@core/game/domain/game-participant.entity";

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
  readonly schedule: GameSchedule;
  readonly gameType: GameType;
  readonly totalSpots: number;
  readonly pricePerPerson: number;
  readonly intensity: GameIntensity;
  readonly ageRange: AgeRange;

  private participants: GameParticipant[] = [];

  constructor(props: {
    id: GameId;
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
    this.validate();
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
    return new Game({
      id,
      name: props.name,
      addressLink: props.addressLink,
      schedule,
      gameType,
      totalSpots: props.totalSpots,
      pricePerPerson: props.pricePerPerson,
      intensity: props.intensity,
      ageRange,
    });
  }

  /**
   * Retorna a lista de participantes inscritos no jogo.
   */
  public getParticipants(): GameParticipant[] {
    return this.participants;
  }

  /**
   * Retorna o número de vagas disponíveis.
   */
  public availableSpots(): number {
    return this.totalSpots - this.participants.length;
  }

  /**
   * Indica se ainda há vagas disponíveis.
   */
  public hasAvailableSpots(): boolean {
    return this.availableSpots() > 0;
  }

  public addParticipant(participant: GameParticipant): void {
    if (!this.hasAvailableSpots()) {
      throw new Error("Não há vagas disponíveis para adicionar participantes.");
    }
    this.participants.push(participant);
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
    // Validação adicional: mínimo para 2 times com base no formato do jogo
    if (this.totalSpots < this.gameType.teamFormat.playersPerTeam * 2) {
      this.notification.addError(
        "O número de vagas deve ser suficiente para acomodar todos os jogadores.",
        "totalSpots",
      );
    }
  }
}
