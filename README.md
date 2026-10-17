# API Web 2 — Entrega 1

API REST em Node.js + TypeScript com Express 5, TypeORM 0.3, PostgreSQL e Yup. Esta entrega cobre os 5 CRUDs e as migrations, sem autenticação (fica para a Entrega 2).

## Modelo de dados

- `situations` (`nameSituation` único) 1—N `users` (`email` único, `password` com hash bcrypt)
- `productsituations` 1—N `products`
- `productcategories` 1—N `products` (`slug` único)

Todas as FKs usam `ON DELETE CASCADE`.

## Setup

Pré-requisitos: Node 20+ e um PostgreSQL acessível.

```bash
cd api
npm install
cp .env.example .env        # ajuste host, porta, usuário, senha e DB_DATABASE
```

Crie o banco informado em `DB_DATABASE` (ex.: `createdb api_web2`). Com Docker:

```bash
docker run -d --name api-web2-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=api_web2 -p 5432:5432 postgres:17-alpine
```

(nesse caso use `DB_USERNAME=postgres` e `DB_PASSWORD=postgres` no `.env`).

## Scripts

| Comando                   | O que faz                                        |
| ------------------------- | ------------------------------------------------ |
| `npm run build`           | Compila TypeScript para `dist/`                  |
| `npm start`               | Sobe a API (`dist/index.js`)                     |
| `npm run start:watch`     | Compila e reinicia a API a cada alteração        |
| `npm run migration:run`   | Compila e aplica as migrations                   |
| `npm run migration:revert`| Reverte a última migration                       |
| `npm run seed`            | Compila e popula o banco (idempotente)           |
| `npm run smoke`           | Smoke test dos 5 CRUDs (API precisa estar no ar) |

## Rodando do zero

```bash
npm run migration:run
npm run seed
npm start
```

Seeds, na ordem de dependência: Situations → Users → ProductSituations → ProductCategories → Products. Os usuários do seed (`admin@example.com`, `maria@example.com`, `joao@example.com`) usam a senha `123456` — apenas para desenvolvimento.

## Endpoints

Listagens aceitam `?page=` e `?limit=` (padrão 1 e 10, máximo 100) e retornam `currentPage`, `lastPage`, `total` e a lista. Respostas de `users` nunca incluem `password`; `users` trazem `situation` e `products` trazem `productSituation` e `productCategory`.

| Recurso           | Rotas                                                                                     | Campos (POST)                                           |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Situation         | `GET/POST /situations`, `GET/PUT/DELETE /situations/:id`                                  | `nameSituation`                                         |
| ProductSituation  | `GET/POST /productsituations`, `GET/PUT/DELETE /productsituations/:id`                    | `name`                                                  |
| ProductCategory   | `GET/POST /productcategories`, `GET/PUT/DELETE /productcategories/:id`                    | `name`                                                  |
| User              | `GET/POST /users`, `GET/PUT/DELETE /users/:id`                                            | `name`, `email`, `password`, `situationId`              |
| Product           | `GET/POST /products`, `GET/PUT/DELETE /products/:id`                                      | `name`, `slug`, `productSituationId`, `productCategoryId` |

Também há `GET /health`.

Códigos de status: `200`/`201` sucesso, `400` validação (Yup), ID inválido, página inválida ou FK inexistente, `404` registro não encontrado, `409` valor único repetido (nome da situação, e-mail, slug), `500` erro interno. No `PUT`, todos os campos são opcionais.

## Smoke test

Com a API no ar (`npm start`):

```bash
BASE_URL=http://localhost:8080 npm run smoke
```

Cobre, para os 5 recursos: criação válida e inválida, listagem paginada, página inexistente, busca por ID (existente, inexistente e inválido), atualização, conflitos (`409`), FKs inexistentes, ausência de `password` nas respostas, relações carregadas, remoção e cascata ao apagar uma Situation. Termina com código de saída diferente de zero se algo falhar.
