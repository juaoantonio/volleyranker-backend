import { IUseCase } from "@core/@shared/application/use-case.interface";
import { IPlayerRepository } from "@core/player/domain/player.repository";
import { Player, PlayerId } from "@core/player/domain/player.aggregate";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";

export class UpdatePlayerUseCase
  implements
    IUseCase<UpdatePlayerUseCaseInput, Promise<UpdatePlayerUseCaseOutput>>
{
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(
    input: UpdatePlayerUseCaseInput,
  ): Promise<UpdatePlayerUseCaseOutput> {
    const playerId = PlayerId.create(input.id);
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new EntityNotFoundError(PlayerId, Player);
    }
    player.changeName(input.name);
    await this.playerRepository.update(player);
    return;
  }
}

export class UpdatePlayerUseCaseInput {
  id: string;
  name: string;
}

export class UpdatePlayerUseCaseOutput {}
