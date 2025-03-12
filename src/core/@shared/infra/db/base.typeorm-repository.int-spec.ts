import { AggregateRoot } from "@core/@shared/domain/aggregate-root";
import { Uuid } from "@core/@shared/domain/value-objects/uuid.vo";
import { BaseTypeormRepository } from "@core/@shared/infra/db/base.typeorm-repository";
import { Entity } from "typeorm";
import { BaseModel } from "@core/@shared/infra/db/base.model";
import { IModelMapper } from "@core/@shared/infra/db/model.mapper.interface";
import { UnitOfWorkTypeORM } from "@core/@shared/infra/db/unit-of-work.typeorm";
import { setupTypeOrmForIntegrationTests } from "@core/@shared/infra/testing/helpers";
import { SearchParams } from "@core/@shared/domain/repository/search-params";
import { SearchResult } from "@core/@shared/domain/repository/search-result";

class StubEntityId extends Uuid {}

class StubEntity extends AggregateRoot<StubEntityId> {
  name: string;

  constructor(id: StubEntityId, name: string) {
    super(id);
    this.name = name;
  }
}

@Entity()
class StubModel extends BaseModel {
  name: string;

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}

class StubModelMapper implements IModelMapper<StubEntity, StubModel> {
  toDomain(model: StubModel): StubEntity {
    return new StubEntity(StubEntityId.create(model.id), model.name);
  }

  toModel(entity: StubEntity): StubModel {
    return new StubModel(entity.getId().getValue(), entity.name);
  }
}

class StubTypeormRepository extends BaseTypeormRepository<
  StubEntityId,
  StubEntity,
  StubModel
> {
  sortableFields: string[];

  getEntity(): { new (...args: any[]): StubEntity } {
    return StubEntity;
  }

  search(props: SearchParams<string>): Promise<SearchResult<StubEntity>> {
    return Promise.resolve(undefined);
  }
}

describe("[INTEGRAÇÃO] - [BaseTypeormRepository] - Suíte de Testes", () => {
  const exampleStub = new StubEntity(
    StubEntityId.create("88417209-6ea3-40e4-8595-d351dfaa9b16"),
    "John Doe",
  );

  let uow: UnitOfWorkTypeORM;
  let stubRepository: StubTypeormRepository;
  const setup = setupTypeOrmForIntegrationTests({
    logging: true,
    entities: [StubModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkTypeORM(setup.dataSource);
    stubRepository = new StubTypeormRepository(
      setup.dataSource.getRepository(StubModel),
      new StubModelMapper(),
      StubEntityId,
      uow,
    );

    await stubRepository.save(exampleStub);
  });

  afterAll(async () => {
    await setup.dataSource.destroy();
  });

  describe("[GRUPO] - [Modo Normal]", () => {
    it("deve salvar uma entidade", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      const found = await stubRepository.findById(stub.getId());
      expect(found).not.toBeNull();
      expect(found.equals(stub)).toBe(true);
    });

    it("deve salvar várias entidades com saveMany", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const allStubs = await stubRepository.findMany();

      expect(allStubs.length).toBe(4);
    });

    it("deve recuperar uma entidade por id (findById)", async () => {
      const found = await stubRepository.findById(exampleStub.getId());
      expect(found).not.toBeNull();
      expect(found.equals(exampleStub)).toBe(true);
    });

    it("deve recuperar várias entidades (findMany)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const foundStubs = await stubRepository.findMany();
      expect(foundStubs.length).toBe(4);
    });

    it("deve recuperar entidades por ids (findManyByIds)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const ids = stubs.map((s) => s.getId());
      const foundStubs = await stubRepository.findManyByIds(ids);
      expect(foundStubs.length).toEqual(ids.length);
    });

    it("deve verificar existência de entidades (existsById)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
      ];
      await stubRepository.saveMany(stubs);
      const existingIds = stubs.map((s) => s.getId());
      const randomId = StubEntityId.random();
      const { exists, notExists } = await stubRepository.existsById([
        ...existingIds,
        randomId,
      ]);
      expect(exists.length).toEqual(existingIds.length);
      expect(notExists.length).toEqual(1);
      expect(notExists[0].getValue()).toEqual(randomId.getValue());
    });

    it("deve atualizar uma entidade", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      const found = await stubRepository.findById(stub.getId());
      expect(found.equals(stub)).toBe(true);

      found.name = "Updated Alice";
      await stubRepository.update(found);
      const updated = await stubRepository.findById(stub.getId());
      expect(updated.name).toEqual("Updated Alice");
      expect(updated.equals(found)).toBe(true);
    });

    it("deve deletar uma entidade", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      await stubRepository.delete(stub.getId());
      const found = await stubRepository.findById(stub.getId());
      expect(found).toBeNull();
    });

    it("deve deletar várias entidades (deleteManyByIds)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const ids = stubs.map((s) => s.getId());
      await stubRepository.deleteManyByIds(ids);
      for (const id of ids) {
        const found = await stubRepository.findById(id);
        expect(found).toBeNull();
      }
    });
  });

  describe("[GRUPO] - [Modo Transacional]", () => {
    it("deve salvar uma entidade dentro de uma transação (commit)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await uow.start();
      await stubRepository.save(stub);
      await uow.commit();
      const found = await stubRepository.findById(stub.getId());
      expect(found).not.toBeNull();
      expect(found.equals(stub)).toBe(true);
    });

    it("não deve salvar uma entidade dentro de uma transação (rollback)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await uow.start();
      await stubRepository.save(stub);
      await uow.rollback();
      const found = await stubRepository.findById(stub.getId());
      expect(found).toBeNull();
    });

    it("deve salvar várias entidades com saveMany dentro de uma transação (commit)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await uow.start();
      await stubRepository.saveMany(stubs);
      await uow.commit();
      const foundStubs = await stubRepository.findMany();

      expect(foundStubs.length).toBe(4);
    });

    it("não deve salvar várias entidades com saveMany dentro de uma transação (rollback)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await uow.start();
      await stubRepository.saveMany(stubs);
      await uow.rollback();
      const foundStubs = await stubRepository.findMany();

      const ids = stubs.map((s) => s.getId().getValue());
      const filtered = foundStubs.filter((s) =>
        ids.includes(s.getId().getValue()),
      );
      expect(filtered.length).toEqual(0);
    });

    it("deve atualizar uma entidade dentro de uma transação (commit)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      const found = await stubRepository.findById(stub.getId());
      expect(found.equals(stub)).toBe(true);
      found.name = "Transactional Updated";
      await uow.start();
      await stubRepository.update(found);
      await uow.commit();
      const updated = await stubRepository.findById(stub.getId());
      expect(updated.name).toEqual("Transactional Updated");
      expect(updated.equals(found)).toBe(true);
    });

    it("não deve atualizar uma entidade dentro de uma transação (rollback)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      const found = await stubRepository.findById(stub.getId());
      expect(found.equals(stub)).toBe(true);
      found.name = "Transactional Updated";
      await uow.start();
      await stubRepository.update(found);
      await uow.rollback();
      const notUpdated = await stubRepository.findById(stub.getId());
      expect(notUpdated.name).not.toEqual("Transactional Updated");
      expect(notUpdated.equals(stub)).toBe(true);
    });

    it("deve deletar uma entidade dentro de uma transação (commit)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      await uow.start();
      await stubRepository.delete(stub.getId());
      await uow.commit();
      const found = await stubRepository.findById(stub.getId());
      expect(found).toBeNull();
    });

    it("não deve deletar uma entidade dentro de uma transação (rollback)", async () => {
      const stub = new StubEntity(StubEntityId.random(), "Alice");
      await stubRepository.save(stub);
      await uow.start();
      await stubRepository.delete(stub.getId());
      await uow.rollback();
      const found = await stubRepository.findById(stub.getId());
      expect(found).not.toBeNull();
      expect(found.equals(stub)).toBe(true);
    });

    it("deve deletar várias entidades com deleteManyByIds dentro de uma transação (commit)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const ids = stubs.map((s) => s.getId());
      await uow.start();
      await stubRepository.deleteManyByIds(ids);
      await uow.commit();
      for (const id of ids) {
        const found = await stubRepository.findById(id);
        expect(found).toBeNull();
      }
    });

    it("não deve deletar várias entidades com deleteManyByIds dentro de uma transação (rollback)", async () => {
      const stubs = [
        new StubEntity(StubEntityId.random(), "Alice"),
        new StubEntity(StubEntityId.random(), "Bob"),
        new StubEntity(StubEntityId.random(), "Carol"),
      ];
      await stubRepository.saveMany(stubs);
      const ids = stubs.map((s) => s.getId());
      await uow.start();
      await stubRepository.deleteManyByIds(ids);
      await uow.rollback();
      for (const id of ids) {
        const found = await stubRepository.findById(id);
        expect(found).not.toBeNull();
      }
    });
  });
});
