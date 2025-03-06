import { IUnitOfWork } from "@core/@shared/domain/unit-of-work.interface";
import { DataSource, QueryRunner } from "typeorm";
import { TransactionNotStartedError } from "@core/@shared/domain/error/transaction-not-started.error";

export class UnitOfWorkTypeorm implements IUnitOfWork {
  private queryRunner: QueryRunner | null;

  constructor(private dataSource: DataSource) {}

  async start(): Promise<void> {
    this.validateTransaction();
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    this.validateTransaction();
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
    this.queryRunner = null;
  }

  async rollback(): Promise<void> {
    this.validateTransaction();
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
    this.queryRunner = null;
  }

  getTransaction(): any {
    return this.queryRunner;
  }

  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    let isAutoTransaction = false;
    try {
      if (this.queryRunner) {
        const result = await workFn(this);
        this.queryRunner = null;
        return result;
      }
      return await this.dataSource.transaction(async (manager) => {
        isAutoTransaction = true;
        this.queryRunner = manager.queryRunner;
        const result = await workFn(this);
        this.queryRunner = null;
        return result;
      });
    } catch (error) {
      if (!isAutoTransaction) {
        await this.queryRunner.rollbackTransaction();
      }
      this.queryRunner = null;
      throw error;
    }
  }

  private validateTransaction(): void {
    if (!this.queryRunner) {
      throw new TransactionNotStartedError();
    }
  }
}
