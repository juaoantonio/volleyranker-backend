import { ValueObject } from "@core/@shared/domain/value-object";
import { format, isBefore, parse } from "date-fns";

export class GameSchedule extends ValueObject {
  readonly day: Date; // Representa o dia do jogo (apenas data)
  readonly startTime: string; // Formato esperado: "HH:mm"
  readonly endTime: string; // Formato esperado: "HH:mm"

  constructor(day: Date, startTime: string, endTime: string) {
    super();
    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
    this.validate();
  }

  /**
   * Retorna o DateTime de início, combinando o dia com o horário de início.
   */
  getStartDateTime(): Date {
    const dayStr = format(this.day, "yyyy-MM-dd");
    const dateTimeStr = `${dayStr}T${this.startTime}`;
    return parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm", new Date());
  }

  /**
   * Retorna o DateTime de término, combinando o dia com o horário de término.
   */
  getEndDateTime(): Date {
    const dayStr = format(this.day, "yyyy-MM-dd");
    const dateTimeStr = `${dayStr}T${this.endTime}`;
    return parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm", new Date());
  }

  /**
   * Calcula a duração do período em minutos.
   */
  getDurationInMinutes(): number {
    const start = this.getStartDateTime();
    const end = this.getEndDateTime();
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  /**
   * Retorna uma string formatada representando o período do jogo.
   */
  toString(): string {
    const dayStr = format(this.day, "yyyy-MM-dd");
    return `${dayStr} das ${this.startTime} às ${this.endTime}`;
  }

  /**
   * Valida os dados do VO:
   * - Os horários devem estar no formato "HH:mm".
   * - O horário de início deve ser anterior ao horário de término.
   * - O horário de início não pode estar no passado.
   */
  validate(): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(this.startTime)) {
      throw new Error("O horário de início deve estar no formato HH:mm.");
    }
    if (!timeRegex.test(this.endTime)) {
      throw new Error("O horário de término deve estar no formato HH:mm.");
    }

    const startDateTime = this.getStartDateTime();
    const endDateTime = this.getEndDateTime();

    if (!isBefore(startDateTime, endDateTime)) {
      throw new Error(
        "O horário de início deve ser anterior ao horário de término.",
      );
    }

    const now = new Date();
    if (isBefore(startDateTime, now)) {
      throw new Error("O horário de início não pode estar no passado.");
    }
  }
}
