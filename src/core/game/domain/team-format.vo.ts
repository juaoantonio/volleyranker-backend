import { ValueObject } from "@core/@shared/domain/value-object";
import { GameGender } from "@core/game/domain/game.aggregate";

export class TeamFormat extends ValueObject {
  readonly playersPerTeam: number;
  readonly gender: GameGender;

  constructor(playersPerTeam: number, gender: GameGender) {
    super();
    const allowedOptions = [2, 3, 4, 5, 6, 7];
    if (!allowedOptions.includes(playersPerTeam)) {
      throw new Error(
        "O número de jogadores por time deve ser um dos seguintes valores: 2, 3, 4, 5, 6 ou 7.",
      );
    }
    this.playersPerTeam = playersPerTeam;
    this.gender = gender;
  }
}
