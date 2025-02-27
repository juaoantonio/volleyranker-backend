import { IsNotBlank } from "@core/@shared/domain/class-validator-decorators/custom-class-validator-decorators";
import { MinLength } from "class-validator";
import { VolleyGroup } from "@core/volleygroup/domain/volleygroup.aggregate";
import { ClassValidatorFields } from "@core/@shared/domain/validators/class-validator-fields";
import { INotification } from "@core/@shared/domain/validators/notification.interface";

class VolleyGroupRules {
  @IsNotBlank({ message: "Não deve ter somente espaços", groups: ["name"] })
  @MinLength(3, { message: "Deve ser maior ou igual a 3", groups: ["name"] })
  name: string;

  constructor(aggregate: VolleyGroup) {
    Object.assign(this, aggregate);
  }
}

export class VolleyGroupValidator extends ClassValidatorFields {
  validate(
    notification: INotification,
    data: VolleyGroup,
    fields?: string[],
  ): void {
    const newFields = fields?.length ? fields : Object.keys(data);
    return super.validate(notification, new VolleyGroupRules(data), newFields);
  }
}

export class VolleyGroupValidatorFactory {
  static create() {
    return new VolleyGroupValidator();
  }
}
