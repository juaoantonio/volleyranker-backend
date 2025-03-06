import { BaseModel } from "@core/@shared/infra/db/base.model";
import { Column } from "typeorm";

export class PlayerModel extends BaseModel {
  @Column({
    type: "uuid",
    unique: true,
  })
  userId: string;

  @Column({
    type: "varchar",
  })
  name: string;

  @Column({
    type: "boolean",
  })
  hasBeenEvaluated: boolean;

  @Column({
    type: "number",
  })
  attackStat: number;

  @Column({
    type: "number",
  })
  defenseStat: number;

  @Column({
    type: "number",
  })
  setStat: number;

  @Column({
    type: "number",
  })
  serviceStat: number;

  @Column({
    type: "number",
  })
  blockStat: number;

  @Column({
    type: "number",
  })
  receptionStat: number;

  @Column({
    type: "number",
  })
  positioningStat: number;

  @Column({
    type: "number",
  })
  consistencyStat: number;

  constructor(props: Omit<PlayerModel, "createdAt" | "updatedAt">) {
    super();
    Object.assign(this, props);
  }
}
