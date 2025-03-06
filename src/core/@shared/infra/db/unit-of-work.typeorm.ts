import { DataSource, QueryRunner } from "typeorm";
import { IUnitOfWork } from "@core/@shared/domain/unit-of-work.interface";
import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { TransactionNotStartedError } from "@core/@shared/domain/error/transaction-not-started.error";

export class UnitOfWorkTypeORM implements IUnitOfWork {
  private queryRunner: QueryRunner | null = null;
  private aggregateRoots: Set<AggregateRoot<any>> = new Set<
    AggregateRoot<any>
  >();

  constructor(private dataSource: DataSource) {}

  async start(): Promise<void> {
    if (!this.queryRunner) {
      this.queryRunner = this.dataSource.createQueryRunner();
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();
    }
  }

  async commit(): Promise<void> {
    this.validateTransaction();
    await this.queryRunner!.commitTransaction();
    await this.queryRunner!.release();
    this.queryRunner = null;
  }

  async rollback(): Promise<void> {
    this.validateTransaction();
    await this.queryRunner!.rollbackTransaction();
    await this.queryRunner!.release();
    this.queryRunner = null;
  }

  getTransaction() {
    return this.queryRunner;
  }

  async do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    if (this.queryRunner) {
      // Se já há uma transação ativa, usa-a sem criar uma nova.
      return await workFn(this);
    } else {
      // Cria um novo QueryRunner para uma transação "automática"
      const queryRunner = this.dataSource.createQueryRunner();
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        this.queryRunner = queryRunner;
        const result = await workFn(this);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
        this.queryRunner = null;
      }
    }
  }

  addAggregateRoot(aggregateRoot: AggregateRoot<any>): void {
    this.aggregateRoots.add(aggregateRoot);
  }

  getAggregateRoots(): AggregateRoot<any>[] {
    return Array.from(this.aggregateRoots);
  }

  private validateTransaction() {
    if (!this.queryRunner) {
      throw new TransactionNotStartedError();
    }
  }
}
