import { ValueObject } from "@core/@shared/domain/value-object";

export type SortDirection = "asc" | "desc";

export type SearchParamsConstructorProps<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
};

export class SearchParams<Filter = string> extends ValueObject {
  constructor(props: SearchParamsConstructorProps<Filter> = {}) {
    super();
    this.page = props.page!;
    this.perPage = props.perPage!;
    this.sort = props.sort!;
    this.sortDir = props.sortDir!;
    this.filter = props.filter!;
  }

  protected _page: number;

  get page() {
    return this._page;
  }

  private set page(value: number) {
    let _page = +value;

    if (Number.isNaN(_page) || _page <= 0 || parseInt(_page as any) !== _page) {
      _page = 1;
    }

    this._page = _page;
  }

  protected _perPage: number = 10;

  get perPage() {
    return this._perPage;
  }

  private set perPage(value: number) {
    let perPage = value === (true as any) ? this._perPage : +value;

    if (
      Number.isNaN(perPage) ||
      perPage <= 0 ||
      parseInt(perPage as any) !== perPage
    ) {
      perPage = this._perPage;
    }

    this._perPage = perPage;
  }

  protected _sort: string | null;

  get sort(): string | null {
    return this._sort;
  }

  private set sort(value: string | null) {
    this._sort =
      value === null || value === undefined || value === "" ? null : `${value}`;
  }

  protected _sortDir: SortDirection | null;

  get sortDir(): SortDirection | null {
    return this._sortDir;
  }

  private set sortDir(value: SortDirection | null) {
    if (!this.sort) {
      this._sortDir = null;
      return;
    }
    const dir = `${value}`.toLowerCase();
    this._sortDir = dir !== "asc" && dir !== "desc" ? "asc" : dir;
  }

  protected _filter: Filter | null;

  get filter(): Filter | null {
    return this._filter;
  }

  protected set filter(value: Filter | null) {
    this._filter =
      value === null || value === undefined || (value as unknown) === ""
        ? null
        : (`${value}` as any);
  }
}
