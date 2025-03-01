import { Chance } from "chance";
import {
  Player,
  PlayerConstructorProps,
  PlayerId,
} from "@core/player/domain/player.aggregate";

type PropOrFactory<T> = T | ((index: number) => T);

export class PlayerFakeBuilder<TBuild = Player> {
  private countObjs: number;
  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = new Chance();
  }

  // Propriedades privadas com valores padrão (utilizando Chance para gerar dados aleatórios)
  private _id: PropOrFactory<PlayerId> = () => PlayerId.random() as PlayerId;

  // Getters para acessar os valores padrão de uma única instância (útil para inspeção ou asserts)
  get id() {
    return this.getValue("id");
  }

  private _userId: PropOrFactory<string> = () => this.chance.guid();

  get userId() {
    return this.getValue("userId");
  }

  private _name: PropOrFactory<string> = () => this.chance.name();

  get name() {
    return this.getValue("name");
  }

  private _attackStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get attackStat() {
    return this.getValue("attackStat");
  }

  private _defenseStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get defenseStat() {
    return this.getValue("defenseStat");
  }

  private _setStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get setStat() {
    return this.getValue("setStat");
  }

  private _serviceStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get serviceStat() {
    return this.getValue("serviceStat");
  }

  private _blockStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get blockStat() {
    return this.getValue("blockStat");
  }

  private _receptionStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get receptionStat() {
    return this.getValue("receptionStat");
  }

  private _positioningStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get positioningStat() {
    return this.getValue("positioningStat");
  }

  private _consistencyStat: PropOrFactory<number> = () =>
    this.chance.floating({ min: 0, max: 100 });

  get consistencyStat() {
    return this.getValue("consistencyStat");
  }

  // Métodos estáticos para inicializar o builder
  static aPlayer() {
    return new PlayerFakeBuilder<Player>();
  }

  static thePlayers(countObjs: number) {
    return new PlayerFakeBuilder<Player[]>(countObjs);
  }

  // Métodos "with" para customizar as propriedades
  withId(valueOrFactory: PropOrFactory<PlayerId>) {
    this._id = valueOrFactory;
    return this;
  }

  withUserId(valueOrFactory: PropOrFactory<string>) {
    this._userId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withAttackStat(valueOrFactory: PropOrFactory<number>) {
    this._attackStat = valueOrFactory;
    return this;
  }

  withDefenseStat(valueOrFactory: PropOrFactory<number>) {
    this._defenseStat = valueOrFactory;
    return this;
  }

  withSetStat(valueOrFactory: PropOrFactory<number>) {
    this._setStat = valueOrFactory;
    return this;
  }

  withServiceStat(valueOrFactory: PropOrFactory<number>) {
    this._serviceStat = valueOrFactory;
    return this;
  }

  withBlockStat(valueOrFactory: PropOrFactory<number>) {
    this._blockStat = valueOrFactory;
    return this;
  }

  withReceptionStat(valueOrFactory: PropOrFactory<number>) {
    this._receptionStat = valueOrFactory;
    return this;
  }

  withPositioningStat(valueOrFactory: PropOrFactory<number>) {
    this._positioningStat = valueOrFactory;
    return this;
  }

  withConsistencyStat(valueOrFactory: PropOrFactory<number>) {
    this._consistencyStat = valueOrFactory;
    return this;
  }

  // Método para construir a instância ou instâncias de Player
  build(): TBuild {
    const players = Array.from({ length: this.countObjs }).map((_, index) => {
      // Obtém os valores, considerando se foram definidos como valor direto ou função de fábrica
      const idValue = this.callFactory(this._id, index);
      const userIdValue = this.callFactory(this._userId, index);
      const nameValue = this.callFactory(this._name, index);
      const attackStatValue = this.callFactory(this._attackStat, index);
      const defenseStatValue = this.callFactory(this._defenseStat, index);
      const setStatValue = this.callFactory(this._setStat, index);
      const serviceStatValue = this.callFactory(this._serviceStat, index);
      const blockStatValue = this.callFactory(this._blockStat, index);
      const receptionStatValue = this.callFactory(this._receptionStat, index);
      const positioningStatValue = this.callFactory(
        this._positioningStat,
        index,
      );
      const consistencyStatValue = this.callFactory(
        this._consistencyStat,
        index,
      );

      const constructorProps: PlayerConstructorProps = {
        id: idValue as PlayerId,
        userId: userIdValue,
        name: nameValue,
        attackStat: attackStatValue,
        defenseStat: defenseStatValue,
        setStat: setStatValue,
        serviceStat: serviceStatValue,
        blockStat: blockStatValue,
        receptionStat: receptionStatValue,
        positioningStat: positioningStatValue,
        consistencyStat: consistencyStatValue,
      };

      return new Player(constructorProps);
    });

    return this.countObjs === 1 ? (players[0] as any) : players;
  }

  // Método auxiliar para obter um valor único (para getters)
  private getValue(prop: keyof PlayerFakeBuilder<any>) {
    const privateProp = `_${prop}` as keyof this;
    if (this[privateProp] === undefined) {
      throw new Error(
        `Propriedade ${prop} não possui uma factory definida. Use métodos 'with'.`,
      );
    }
    return this.callFactory(this[privateProp] as PropOrFactory<any>, 0);
  }

  // Método auxiliar para invocar a factory ou retornar o valor diretamente
  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === "function"
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}
