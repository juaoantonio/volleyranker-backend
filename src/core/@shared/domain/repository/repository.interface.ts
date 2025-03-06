import { Entity } from "../entity";
import { Identifier } from "../identifier";
import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { SearchParams } from "@core/@shared/domain/repository/search-params";
import { SearchResult } from "@core/@shared/domain/repository/search-result";

export interface IRepository<
  AggregateId extends Identifier,
  A extends Entity<AggregateId>,
> {
  save(aggregate: A): Promise<void>;

  saveMany(aggregates: A[]): Promise<void>;

  findById(aggregateId: AggregateId): Promise<A | null>;

  findMany(): Promise<A[]>;

  findManyByIds(aggregateIds: AggregateId[]): Promise<A[]>;

  update(aggregate: A): Promise<void>;

  delete(aggregateId: AggregateId): Promise<void>;

  deleteManyByIds(aggregateIds: AggregateId[]): Promise<void>;

  existsById(
    aggregateIds: AggregateId[],
  ): Promise<{ exists: AggregateId[]; notExists: AggregateId[] }>;

  getEntity(): new (...args: any[]) => A;
}

export interface ISearchableRepository<
  AggregateId extends Identifier,
  A extends AggregateRoot<AggregateId>,
  Filter = string,
  SearchInput extends SearchParams<Filter> = SearchParams<Filter>,
  SearchOutput extends SearchResult<A> = SearchResult<A>,
> extends IRepository<AggregateId, A> {
  sortableFields: string[];

  search(props: SearchInput): Promise<SearchOutput>;
}
