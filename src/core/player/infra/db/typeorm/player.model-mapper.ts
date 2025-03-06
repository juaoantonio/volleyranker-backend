import { IModelMapper } from "@core/@shared/infra/db/model.mapper.interface";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { PlayerModel } from "@core/player/infra/db/typeorm/player.model";

export class PlayerModelMapper implements IModelMapper<Player, PlayerModel> {
  toDomain(model: PlayerModel): Player {
    return new Player({
      id: PlayerId.create(model.id),
      userId: model.userId,
      name: model.name,
      attackStat: model.attackStat,
      defenseStat: model.defenseStat,
      setStat: model.setStat,
      serviceStat: model.serviceStat,
      blockStat: model.blockStat,
      receptionStat: model.receptionStat,
      positioningStat: model.positioningStat,
      consistencyStat: model.consistencyStat,
      hasBeenEvaluated: model.hasBeenEvaluated,
    });
  }

  toModel(aggregate: Player): PlayerModel {
    return new PlayerModel({
      id: aggregate.getId().getValue(),
      userId: aggregate.userId,
      name: aggregate.name,
      attackStat: aggregate.attackStat,
      defenseStat: aggregate.defenseStat,
      setStat: aggregate.setStat,
      serviceStat: aggregate.serviceStat,
      blockStat: aggregate.blockStat,
      receptionStat: aggregate.receptionStat,
      positioningStat: aggregate.positioningStat,
      consistencyStat: aggregate.consistencyStat,
      hasBeenEvaluated: aggregate.hasBeenEvaluated,
    });
  }
}
