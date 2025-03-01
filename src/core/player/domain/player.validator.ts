import { IsUUID, Max, Min, MinLength } from "class-validator";
import { Player } from "@core/player/domain/player.aggregate";
import { ClassValidatorFields } from "@core/@shared/domain/validators/class-validator-fields";
import { INotification } from "@core/@shared/domain/validators/notification.interface";
import { IsNotBlank } from "@core/@shared/domain/class-validator-decorators/custom-class-validator-decorators";

class PlayerRules {
  @MinLength(3, {
    message: "Deve ter no mínimo 3 caracteres",
    groups: ["_name"],
  })
  @IsNotBlank({
    message: "Não deve estar em branco",
    groups: ["_name"],
  })
  _name: string;

  @IsUUID("4", {
    message: "Deve ser um UUID válido",
    groups: ["userId"],
  })
  userId: string;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["attackStat"] })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["attackStat"],
  })
  attackStat: number;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["defenseStat"] })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["defenseStat"],
  })
  defenseStat: number;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["setStat"] })
  @Max(100, { message: "Deve ser menor ou igual a 100", groups: ["setStat"] })
  setStat: number;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["serviceStat"] })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["serviceStat"],
  })
  serviceStat: number;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["blockStat"] })
  @Max(100, { message: "Deve ser menor ou igual a 100", groups: ["blockStat"] })
  blockStat: number;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["receptionStat"] })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["receptionStat"],
  })
  receptionStat: number;

  @Min(0, {
    message: "Deve ser maior ou igual a 0",
    groups: ["positioningStat"],
  })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["positioningStat"],
  })
  positioningStat: number;

  @Min(0, {
    message: "Deve ser maior ou igual a 0",
    groups: ["consistencyStat"],
  })
  @Max(100, {
    message: "Deve ser menor ou igual a 100",
    groups: ["consistencyStat"],
  })
  consistencyStat: number;

  constructor(aggregate: Player) {
    Object.assign(this, aggregate);
  }
}

export class PlayerValidator extends ClassValidatorFields {
  validate(notification: INotification, data: Player, fields?: string[]): void {
    const newFields = fields?.length ? fields : Object.keys(data);
    return super.validate(notification, new PlayerRules(data), newFields);
  }
}

export class PlayerValidatorFactory {
  static create() {
    return new PlayerValidator();
  }
}
