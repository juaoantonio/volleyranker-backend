import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Identifier } from "@core/@shared/domain/identifier";
import { ValueObject } from "@core/@shared/domain/value-object";

type SearchResultConstructorProps<A extends AggregateRoot<Identifier>> = {
  items: A[];
  total: number;
  currentPage: number;
  perPage: number;
};

export class SearchResult<
  A extends AggregateRoot<Identifier> = AggregateRoot<Identifier>,
> extends ValueObject {
  readonly items: A[];
  readonly total: number;
  readonly currentPage: number;
  readonly perPage: number;
  readonly lastPage: number;
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  readonly itemsCount: number;

  constructor(props: SearchResultConstructorProps<A>) {
    super();
    this.items = props.items;
    this.total = props.total;
    this.currentPage = props.currentPage;
    this.perPage = props.perPage;
    this.isFirstPage = props.currentPage === 1;
    this.isLastPage =
      props.total === 0
        ? true
        : props.currentPage === Math.ceil(props.total / props.perPage);
    this.lastPage =
      props.total === 0 ? 1 : Math.ceil(this.total / this.perPage);
    this.itemsCount = this.items.length;
  }

  toJSON() {
    return {
      items: this.items,
      total: this.total,
      currentPage: this.currentPage,
      perPage: this.perPage,
      lastPage: this.lastPage,
      isFirstPage: this.isFirstPage,
      isLastPage: this.isLastPage,
      itemsCount: this.itemsCount,
    };
  }
}
