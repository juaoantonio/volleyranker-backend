import { IRepository } from "@core/@shared/domain/repository/repository.interface";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";

export interface IPlayerRepository extends IRepository<PlayerId, Player> {}
