import { BaseModel } from "@core/@shared/infra/db/base.model";
import { Column, Entity } from "typeorm";

@Entity("players")
export class PlayerModel extends BaseModel {
  @Column({
    type: "uuid",
    unique: true,
    name: "user_id",
  })
  userId: string;

  @Column({
    type: "varchar",
    length: 100,
    name: "name",
  })
  name: string;

  @Column({
    type: "boolean",
    name: "has_been_evaluated",
  })
  hasBeenEvaluated: boolean;

  @Column({
    name: "attack_stat",
  })
  attackStat: number;

  @Column({
    name: "defense_stat",
  })
  defenseStat: number;

  @Column({
    name: "set_stat",
  })
  setStat: number;

  @Column({
    name: "service_stat",
  })
  serviceStat: number;

  @Column({
    name: "block_stat",
  })
  blockStat: number;

  @Column({
    name: "reception_stat",
  })
  receptionStat: number;

  @Column({
    name: "positioning_stat",
  })
  positioningStat: number;

  @Column({
    name: "consistency_stat",
  })
  consistencyStat: number;

  constructor(props: Omit<PlayerModel, "createdAt" | "updatedAt">) {
    super();
    Object.assign(this, props);
  }
}
