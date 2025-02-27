import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { Entity } from "@core/@shared/domain/entity";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";

export class GameParticipantId extends Uuid {}

export class GameParticipant extends Entity<GameParticipantId> {
  readonly playerId: PlayerId;

  constructor(playerId: string, hasPaid: boolean = false, id?: string) {
    super(id ? GameParticipantId.create(id) : GameParticipantId.random());
    this.playerId = PlayerId.create(playerId);
    this._hasPaid = hasPaid;
  }

  private _hasPaid: boolean;

  get hasPaid() {
    return this._hasPaid;
  }

  public static create(
    playerId: string,
    hasPaid: boolean = false,
    id?: string,
  ): GameParticipant {
    return new GameParticipant(playerId, hasPaid, id);
  }

  public static createFromPlayer(player: Player): GameParticipant {
    return new GameParticipant(player.getId().toString());
  }

  public markAsPaid(): void {
    this._hasPaid = true;
  }

  public markAsNotPaid(): void {
    this._hasPaid = false;
  }
}
