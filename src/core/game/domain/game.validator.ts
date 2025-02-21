import { ClassValidatorFields } from "@core/@shared/domain/validators/class-validator-fields";
import { INotification } from "@core/@shared/domain/validators/notification.interface";
import { Game } from "@core/game/domain/game.aggregate";
import { IsUrl, Min, MinLength } from "class-validator";
import { IsNotBlank } from "@core/@shared/domain/class-validator-decorators/custom-class-validator-decorators";

class GameRules {
  // deve ser uma string com no minimo 3 caracteres
  @IsNotBlank({ message: "Não deve ter somente espaços", groups: ["name"] })
  @MinLength(3, { message: "Deve ser maior ou igual a 3", groups: ["name"] })
  name: string;

  @IsUrl({}, { message: "Deve ser uma URL válida", groups: ["addressLink"] })
  addressLink: string;

  @Min(0, { message: "Deve ser maior ou igual a 0", groups: ["totalSpots"] })
  totalSpots: number;

  @Min(0, {
    message: "Deve ser maior ou igual a 0",
    groups: ["pricePerPerson"],
  })
  pricePerPerson: number;

  constructor(aggregate: Game) {
    Object.assign(this, aggregate);
  }
}

export class GameValidator extends ClassValidatorFields {
  validate(notification: INotification, data: Game, fields?: string[]): void {
    const newFields = fields?.length ? fields : Object.keys(data);
    return super.validate(notification, new GameRules(data), newFields);
  }
}

export class GameValidatorFactory {
  static create() {
    return new GameValidator();
  }
}
