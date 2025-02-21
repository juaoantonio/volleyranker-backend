import { ValueObject } from "@core/@shared/domain/value-object";

export class AgeRange extends ValueObject {
  readonly minAge: number;
  readonly maxAge: number;

  constructor(minAge: number, maxAge: number) {
    super();
    if (minAge < 0 || maxAge < 0) {
      throw new Error("As idades não podem ser negativas.");
    }
    if (minAge > maxAge) {
      throw new Error("A idade mínima não pode ser maior que a idade máxima.");
    }
    this.minAge = minAge;
    this.maxAge = maxAge;
  }
}
