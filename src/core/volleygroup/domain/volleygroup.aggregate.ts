import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { PlayerId } from "@core/player/domain/player.aggregate";
import { Game, GameId } from "@core/game/domain/game.aggregate";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";
import { OwnerRemovalError } from "@core/volleygroup/domain/owner-removal.error";
import { AlreadyMemberError } from "@core/volleygroup/domain/already-member.error";
import { VolleyGroupValidatorFactory } from "@core/volleygroup/domain/volleygroup.validator";

export class VolleyGroupId extends Uuid {}

export interface VolleyGroupCreationProps {
  id?: string;
  name: string;
  description?: string;
  ownerId: string;
}

export class VolleyGroup extends AggregateRoot<VolleyGroupId> {
  readonly name: string;
  readonly description: string;
  readonly ownerId: PlayerId;

  private readonly members: Map<string, PlayerId>;
  private readonly games: Map<string, GameId>;

  constructor(props: {
    id: VolleyGroupId;
    name: string;
    description: string;
    ownerId: PlayerId;
  }) {
    super(props.id);
    this.name = props.name;
    this.description = props.description;
    this.ownerId = props.ownerId;
    this.members = new Map<string, PlayerId>();
    this.games = new Map<string, GameId>();

    this.members.set(this.ownerId.toString(), this.ownerId);
  }

  public static create(props: VolleyGroupCreationProps): VolleyGroup {
    const id = props.id
      ? VolleyGroupId.create(props.id)
      : (VolleyGroupId.random() as VolleyGroupId);
    const volleygroup = new VolleyGroup({
      id,
      name: props.name,
      description: props.description || "",
      ownerId: PlayerId.create(props.ownerId),
    });
    volleygroup.validate();
    return volleygroup;
  }

  public validate(fields?: string[]): void {
    const validator = VolleyGroupValidatorFactory.create();
    validator.validate(this.notification, this, fields);
  }

  public addMember(userId: PlayerId): void {
    if (this.members.has(userId.toString())) {
      throw new AlreadyMemberError("Usuário já é membro do grupo.");
    }
    this.members.set(userId.toString(), userId);
  }

  public removeMember(userId: PlayerId): void {
    if (userId.equals(this.ownerId)) {
      throw new OwnerRemovalError(
        "O proprietário do grupo não pode ser removido.",
      );
    }
    this.members.delete(userId.toString());
  }

  public getMembers(): PlayerId[] {
    return Array.from(this.members.values());
  }

  public addGame(gameId: GameId): void {
    if (this.games.has(gameId.toString())) return;
    this.games.set(gameId.toString(), gameId);
  }

  public removeGame(gameId: GameId): void {
    if (!this.games.has(gameId.toString())) {
      throw new EntityNotFoundError(GameId, Game);
    }
    this.games.delete(gameId.toString());
  }

  public getGames(): GameId[] {
    return Array.from(this.games.values());
  }
}
