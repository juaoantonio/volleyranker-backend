import { AggregateRoot } from "@core/@shared/domain/aggregate-root";

export interface IUnitOfWork {
  start(): Promise<void>;

  commit(): Promise<void>;

  rollback(): Promise<void>;

  getTransaction(): any;

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  addAggregateRoot(aggregateRoot: AggregateRoot<any>): void;

  getAggregateRoots(): AggregateRoot<any>[];
}
