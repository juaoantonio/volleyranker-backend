import { IUseCase } from "@core/@shared/application/use-case.interface";
import { IPlayerRepository } from "@core/player/domain/player.repository";
import { Player } from "@core/player/domain/player.aggregate";
import { EntityValidationError } from "@core/@shared/domain/validators/validation.error";

export class CreatePlayerUseCase
  implements
    IUseCase<CreatePlayerUseCaseInput, Promise<CreatePlayerUseCaseOutput>>
{
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(
    input: CreatePlayerUseCaseInput,
  ): Promise<CreatePlayerUseCaseOutput> {
    const player = Player.create({
      userId: input.userId,
      name: input.name,
    });

    if (player.notification.hasErrors()) {
      throw new EntityValidationError(player.notification.toJSON());
    }
    await this.playerRepository.save(player);
    return;
  }
}

export class CreatePlayerUseCaseInput {
  name: string;
  userId: string;
}

export class CreatePlayerUseCaseOutput {}
