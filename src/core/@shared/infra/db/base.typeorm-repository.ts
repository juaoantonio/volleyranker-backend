import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { BaseModel } from "@core/@shared/infra/db/base.model";
import { SearchParams } from "@core/@shared/domain/repository/search-params";
import { SearchResult } from "@core/@shared/domain/repository/search-result";
import { ISearchableRepository } from "@core/@shared/domain/repository/repository.interface";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { IModelMapper } from "@core/@shared/infra/db/model.mapper.interface";
import { EntityNotFoundError } from "@core/@shared/domain/error/entity-not-found.error";
import { UnitOfWorkTypeORM } from "@core/@shared/infra/db/unit-of-work.typeorm";

export abstract class BaseTypeormRepository<
  Id extends Uuid,
  A extends AggregateRoot<Id>,
  M extends BaseModel,
  Filter = string,
  SearchInput extends SearchParams<Filter> = SearchParams<Filter>,
  SearchOutput extends SearchResult<A> = SearchResult<A>,
> implements ISearchableRepository<Id, A, Filter, SearchInput, SearchOutput>
{
  abstract sortableFields: string[];

  constructor(
    protected readonly modelRepository: Repository<M>,
    protected readonly modelMapper: IModelMapper<A, M>,
    protected readonly uuidVo: { new (...args: any[]): Id } & typeof Uuid,
    protected readonly uow: UnitOfWorkTypeORM,
  ) {}

  async save(aggregate: A): Promise<void> {
    const model = this.modelMapper.toModel(aggregate);
    await this.getRepository().save(model);
  }

  async saveMany(aggregates: A[]): Promise<void> {
    const models = aggregates.map((aggregate) =>
      this.modelMapper.toModel(aggregate),
    );
    await this.getRepository().save(models);
  }

  async findById(aggregateId: Id): Promise<A | null> {
    const result = await this.getRepository().findOne({
      where: {
        id: aggregateId.getValue(),
      } as FindOptionsWhere<M> | FindOptionsWhere<M>[],
      loadEagerRelations: true,
    });
    if (!result) {
      return null;
    }
    return this.modelMapper.toDomain(result);
  }

  async findMany(): Promise<A[]> {
    const result = await this.getRepository().find();
    return result.map((model) => this.modelMapper.toDomain(model));
  }

  async findManyByIds(aggregateIds: Id[]): Promise<A[]> {
    const result = await this.getRepository().find({
      where: {
        id: In(aggregateIds.map((id) => id.getValue())),
      } as FindOptionsWhere<M> | FindOptionsWhere<M>[],
    });
    return result.map((model) => this.modelMapper.toDomain(model));
  }

  async existsById(
    aggregateIds: Id[],
  ): Promise<{ exists: Id[]; notExists: Id[] }> {
    const existingModels = await this.getRepository().find({
      where: {
        id: In(aggregateIds.map((id) => id.getValue())),
      } as FindOptionsWhere<M> | FindOptionsWhere<M>[],
    });
    const existingIds = existingModels.map((model) =>
      this.uuidVo.create(model.id),
    );
    const notExistingIds = aggregateIds.filter(
      (id) => !existingIds.find((existingId) => existingId.equals(id)),
    );
    return {
      exists: existingIds,
      notExists: notExistingIds,
    };
  }

  async update(aggregate: A): Promise<void> {
    const modelExists = await this.getRepository().findOne({
      where: {
        id: aggregate.getId().getValue(),
      } as FindOptionsWhere<M> | FindOptionsWhere<M>[],
    });
    if (!modelExists) {
      throw new EntityNotFoundError(aggregate.getId(), this.getEntity());
    }
    const model = this.modelMapper.toModel(aggregate);
    await this.getRepository().save(model);
  }

  async delete(aggregateId: Id): Promise<void> {
    const deleteResult = await this.getRepository().delete(
      aggregateId.getValue(),
    );
    if (deleteResult.affected === 0) {
      throw new EntityNotFoundError(aggregateId, this.getEntity());
    }
  }

  async deleteManyByIds(aggregateIds: Id[]): Promise<void> {
    const existingModels = await this.existsById(aggregateIds);
    if (existingModels.notExists.length > 0) {
      throw new EntityNotFoundError(existingModels.notExists, this.getEntity());
    }
    const deleteResult = await this.getRepository().delete(
      existingModels.exists.map((id) => id.getValue()),
    );
    if (deleteResult.affected !== existingModels.exists.length) {
      throw new EntityNotFoundError(existingModels.exists, this.getEntity());
    }
  }

  abstract getEntity(): { new (...args: any[]): A };

  abstract search(props: SearchInput): Promise<SearchOutput>;

  /**
   * Retorna o repositório que deverá ser utilizado:
   * - Se houver uma transação ativa, utiliza o manager do QueryRunner para obter o repositório.
   * - Caso contrário, usa o repositório padrão.
   */
  protected getRepository(): Repository<M> {
    const activeTransaction = this.uow.getTransaction();
    if (activeTransaction) {
      return activeTransaction.manager.getRepository<M>(
        this.modelRepository.metadata.target as any,
      );
    }
    return this.modelRepository;
  }
}
