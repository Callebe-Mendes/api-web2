import bcrypt from "bcryptjs";
import { DeepPartial } from "typeorm";
import { AppDataSource, initializeDatabase } from "../data-source";
import { Situation } from "../entities/Situation";
import { User } from "../entities/User";
import { ProductSituation } from "../entities/ProductSituation";
import { ProductCategory } from "../entities/ProductCategory";
import { Product } from "../entities/Product";

const SEED_PASSWORD = "123456";

const situations = ["Ativo", "Inativo", "Pendente"];

const users = [
  { name: "Administrador", email: "admin@example.com", situation: "Ativo" },
  { name: "Maria Silva", email: "maria@example.com", situation: "Ativo" },
  { name: "João Souza", email: "joao@example.com", situation: "Pendente" },
];

const productSituations = ["Disponível", "Indisponível", "Em breve"];

const productCategories = ["Eletrônicos", "Livros", "Vestuário"];

const products = [
  {
    name: "Notebook Pro 14",
    slug: "notebook-pro-14",
    situation: "Disponível",
    category: "Eletrônicos",
  },
  {
    name: "Clean Code",
    slug: "clean-code",
    situation: "Disponível",
    category: "Livros",
  },
  {
    name: "Camiseta Básica",
    slug: "camiseta-basica",
    situation: "Em breve",
    category: "Vestuário",
  },
];

async function seedByName<T extends { id: number }>(
  entity: new () => T,
  field: string,
  names: string[]
): Promise<Map<string, T>> {
  const repository = AppDataSource.getRepository(entity);
  const result = new Map<string, T>();

  for (const name of names) {
    const values = { [field]: name } as DeepPartial<T>;
    const existing = await repository.findOneBy(values as never);
    const record = existing ?? (await repository.save(repository.create(values)));
    result.set(name, record);
  }

  return result;
}

async function runSeeds(): Promise<void> {
  await initializeDatabase();

  const situationByName = await seedByName(Situation, "nameSituation", situations);

  const userRepository = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  for (const user of users) {
    const exists = await userRepository.findOneBy({ email: user.email });
    if (exists) continue;
    await userRepository.save(
      userRepository.create({
        name: user.name,
        email: user.email,
        password: passwordHash,
        situationId: situationByName.get(user.situation)!.id,
      })
    );
  }

  const productSituationByName = await seedByName(
    ProductSituation,
    "name",
    productSituations
  );
  const productCategoryByName = await seedByName(
    ProductCategory,
    "name",
    productCategories
  );

  const productRepository = AppDataSource.getRepository(Product);
  for (const product of products) {
    const exists = await productRepository.findOneBy({ slug: product.slug });
    if (exists) continue;
    await productRepository.save(
      productRepository.create({
        name: product.name,
        slug: product.slug,
        productSituationId: productSituationByName.get(product.situation)!.id,
        productCategoryId: productCategoryByName.get(product.category)!.id,
      })
    );
  }

  console.log("Seeds executados com sucesso!");
}

runSeeds()
  .catch((error) => {
    console.error("Falha ao executar seeds:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
