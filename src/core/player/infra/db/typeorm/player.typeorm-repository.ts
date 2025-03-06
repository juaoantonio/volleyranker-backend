import { BaseTypeormRepository } from "@core/@shared/infra/db/base.typeorm-repository";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { PlayerModel } from "@core/player/infra/db/typeorm/player.model";
import { SearchParams } from "@core/@shared/domain/repository/search-params";
import { SearchResult } from "@core/@shared/domain/repository/search-result";

export class PlayerTypeormRepository extends BaseTypeormRepository<
  PlayerId,
  Player,
  PlayerModel
> {
  sortableFields: string[];

  getEntity(): { new (...args: any[]): Player } {
    return Player;
  }

  search(props: SearchParams<string>): Promise<SearchResult<Player>> {
    return Promise.resolve(undefined);
  }
}
