import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { PlayerValidatorFactory } from "@core/player/domain/player.validator";
import { PlayerFakeBuilder } from "@core/player/domain/player.fake-builder";

export class PlayerId extends Uuid {}

export interface PlayerConstructorProps {
  id: PlayerId;
  userId: string;
  name: string;

  attackStat: number;
  defenseStat: number;
  setStat: number;
  serviceStat: number;
  blockStat: number;
  receptionStat: number;
  positioningStat: number;
  consistencyStat: number;
}

export interface PlayerCreationProps {
  id?: string;
  userId: string;
  name: string;
}

export class Player extends AggregateRoot<PlayerId> {
  static OVERALL_MAX = 100;
  static OVERALL_WEIGHTS = {
    attack: 0.18,
    serve: 0.12,
    set: 0.12,
    defense: 0.17,
    block: 0.13,
    positioning: 0.1,
    reception: 0.1,
    consistency: 0.08,
  };
  static OVERALL_MAX_STDEV = 1.65;
  static OVERALL_BALANCE_BONUS = 2;

  readonly userId: string;
  readonly attackStat: number;
  readonly defenseStat: number;
  readonly setStat: number;
  readonly serviceStat: number;
  readonly blockStat: number;
  readonly receptionStat: number;
  readonly positioningStat: number;
  readonly consistencyStat: number;

  constructor(props: PlayerConstructorProps) {
    super(props.id);
    this.userId = props.userId;
    this._name = props.name;
    this.attackStat = props.attackStat;
    this.defenseStat = props.defenseStat;
    this.setStat = props.setStat;
    this.serviceStat = props.serviceStat;
    this.blockStat = props.blockStat;
    this.receptionStat = props.receptionStat;
    this.positioningStat = props.positioningStat;
    this.consistencyStat = props.consistencyStat;
  }

  private _name: string;

  get name(): string {
    return this._name;
  }

  private _hasBeenEvaluated: boolean = false;

  get hasBeenEvaluated(): boolean {
    return this._hasBeenEvaluated;
  }

  public static create(props: PlayerCreationProps): Player {
    const id = props.id
      ? PlayerId.create(props.id)
      : (PlayerId.random() as PlayerId);
    const player = new Player({
      id: id,
      userId: props.userId,
      name: props.name,
      attackStat: 50,
      defenseStat: 50,
      setStat: 50,
      serviceStat: 50,
      blockStat: 50,
      receptionStat: 50,
      positioningStat: 50,
      consistencyStat: 50,
    });
    player.validate();
    return player;
  }

  static fake(): typeof PlayerFakeBuilder {
    return PlayerFakeBuilder;
  }

  public changeName(name: string): void {
    this._name = name;
  }

  validate(fields?: string[]): void {
    const validator = PlayerValidatorFactory.create();
    validator.validate(this.notification, this, fields);
  }

  public calculateOverall(): number {
    const baseScore =
      this.attackStat * Player.OVERALL_WEIGHTS.attack +
      this.serviceStat * Player.OVERALL_WEIGHTS.serve +
      this.setStat * Player.OVERALL_WEIGHTS.set +
      this.defenseStat * Player.OVERALL_WEIGHTS.defense +
      this.blockStat * Player.OVERALL_WEIGHTS.block +
      this.positioningStat * Player.OVERALL_WEIGHTS.positioning +
      this.receptionStat * Player.OVERALL_WEIGHTS.reception +
      this.consistencyStat * Player.OVERALL_WEIGHTS.consistency;
    const skills = [
      this.attackStat,
      this.serviceStat,
      this.setStat,
      this.defenseStat,
      this.blockStat,
      this.positioningStat,
      this.receptionStat,
      this.consistencyStat,
    ];
    const meanSkill = skills.reduce((sum, val) => sum + val, 0) / skills.length;
    const variance =
      skills.reduce((sum, val) => sum + Math.pow(val - meanSkill, 2), 0) /
      skills.length;
    const stdev = Math.sqrt(variance);
    const balanceBonus =
      (1 - Math.min(1, stdev / Player.OVERALL_MAX_STDEV)) *
      Player.OVERALL_BALANCE_BONUS;
    const advancedScore = baseScore + balanceBonus;
    const overall = Math.min(Player.OVERALL_MAX, advancedScore);

    return Math.round(overall);
  }
}
