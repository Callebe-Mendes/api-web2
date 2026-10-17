/* Smoke test dos 5 CRUDs. Uso: npm run smoke (API rodando em BASE_URL). */
const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const run = Date.now().toString(36);

let passed = 0;
let failed = 0;

async function call(method, path, body) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, body: json };
}

function check(label, condition, details) {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label}`, details === undefined ? "" : JSON.stringify(details));
  }
}

async function crudLookup(title, path, listKey, createBody, updateBody, field) {
  console.log(`\n${title} (${path})`);
  const invalid = await call("POST", path, {});
  check("POST sem campos obrigatórios -> 400", invalid.status === 400, invalid);

  const created = await call("POST", path, createBody);
  check("POST válido -> 201", created.status === 201, created);
  const id = created.body && Object.values(created.body).find((v) => v && v.id)?.id;

  const list = await call("GET", `${path}?limit=1`);
  check("GET lista paginada -> 200", list.status === 200 && Array.isArray(list.body[listKey]) && list.body.total >= 1, list);
  const badPage = await call("GET", `${path}?page=99999`);
  check("GET página inexistente -> 400", badPage.status === 400, badPage);

  const show = await call("GET", `${path}/${id}`);
  check("GET /:id -> 200", show.status === 200 && show.body.id === id, show);
  check("GET /:id inexistente -> 404", (await call("GET", `${path}/999999`)).status === 404);
  check("GET /:id inválido -> 400", (await call("GET", `${path}/abc`)).status === 400);

  const updated = await call("PUT", `${path}/${id}`, updateBody);
  check("PUT -> 200 e valor alterado", updated.status === 200 && Object.values(updated.body).some((v) => v && v[field] === updateBody[field]), updated);
  check("PUT inexistente -> 404", (await call("PUT", `${path}/999999`, updateBody)).status === 404);

  return id;
}

async function main() {
  const health = await call("GET", "/health");
  if (health.status !== 200) {
    console.error(`API indisponível em ${BASE_URL}`);
    process.exit(1);
  }

  const situationId = await crudLookup(
    "Situation", "/situations", "situations",
    { nameSituation: `Smoke ${run}` }, { nameSituation: `Smoke ${run} editada` }, "nameSituation"
  );
  const dup = await call("POST", "/situations", { nameSituation: `Smoke ${run} editada` });
  check("Situation duplicada -> 409", dup.status === 409, dup);

  const productSituationId = await crudLookup(
    "ProductSituation", "/productsituations", "productSituations",
    { name: `Smoke ${run}` }, { name: `Smoke ${run} editada` }, "name"
  );
  const productCategoryId = await crudLookup(
    "ProductCategory", "/productcategories", "productCategories",
    { name: `Smoke ${run}` }, { name: `Smoke ${run} editada` }, "name"
  );

  console.log("\nUser (/users)");
  const email = `smoke-${run}@example.com`;
  const userBody = { name: "Usuário Smoke", email, password: "segredo123", situationId };
  check("POST sem campos -> 400", (await call("POST", "/users", {})).status === 400);
  check("POST e-mail inválido -> 400", (await call("POST", "/users", { ...userBody, email: "x" })).status === 400);
  check("POST senha curta -> 400", (await call("POST", "/users", { ...userBody, password: "123" })).status === 400);
  const noSituation = await call("POST", "/users", { ...userBody, situationId: 999999 });
  check("POST com Situation inexistente -> 400", noSituation.status === 400, noSituation);
  const user = await call("POST", "/users", userBody);
  check("POST válido -> 201", user.status === 201, user);
  check("Resposta não expõe password", user.body.user && !("password" in user.body.user), user.body);
  check("Resposta inclui situation", user.body.user?.situation?.id === situationId, user.body);
  const userId = user.body.user?.id;
  check("POST e-mail repetido -> 409", (await call("POST", "/users", userBody)).status === 409);
  const userList = await call("GET", "/users?limit=1");
  check("GET lista paginada sem password", userList.status === 200 && userList.body.users.every((u) => !("password" in u)), userList.body);
  const userShow = await call("GET", `/users/${userId}`);
  check("GET /:id -> 200 sem password", userShow.status === 200 && !("password" in userShow.body), userShow.body);
  const userPut = await call("PUT", `/users/${userId}`, { name: "Usuário Editado", password: "novasenha123" });
  check("PUT nome e senha -> 200", userPut.status === 200 && userPut.body.user.name === "Usuário Editado" && userPut.body.user.email === email, userPut);
  check("PUT Situation inexistente -> 400", (await call("PUT", `/users/${userId}`, { situationId: 999999 })).status === 400);
  check("PUT inexistente -> 404", (await call("PUT", "/users/999999", { name: "Qualquer" })).status === 404);

  console.log("\nProduct (/products)");
  const slug = `produto-smoke-${run}`;
  const productBody = { name: "Produto Smoke", slug, productSituationId, productCategoryId };
  check("POST sem campos -> 400", (await call("POST", "/products", {})).status === 400);
  check("POST slug inválido -> 400", (await call("POST", "/products", { ...productBody, slug: "Slug Inválido" })).status === 400);
  check("POST com ProductSituation inexistente -> 400", (await call("POST", "/products", { ...productBody, productSituationId: 999999 })).status === 400);
  check("POST com ProductCategory inexistente -> 400", (await call("POST", "/products", { ...productBody, productCategoryId: 999999 })).status === 400);
  const product = await call("POST", "/products", productBody);
  check("POST válido -> 201", product.status === 201, product);
  check("Resposta inclui productSituation e productCategory", product.body.product?.productSituation?.id === productSituationId && product.body.product?.productCategory?.id === productCategoryId, product.body);
  const productId = product.body.product?.id;
  check("POST slug repetido -> 409", (await call("POST", "/products", productBody)).status === 409);
  const productList = await call("GET", "/products?limit=1");
  check("GET lista paginada com relações", productList.status === 200 && productList.body.products[0]?.productCategory !== undefined, productList.body);
  const productShow = await call("GET", `/products/${productId}`);
  check("GET /:id -> 200 com relações", productShow.status === 200 && productShow.body.productSituation?.id === productSituationId, productShow.body);
  const productPut = await call("PUT", `/products/${productId}`, { name: "Produto Editado" });
  check("PUT -> 200", productPut.status === 200 && productPut.body.product.name === "Produto Editado" && productPut.body.product.slug === slug, productPut);
  check("PUT inexistente -> 404", (await call("PUT", "/products/999999", { name: "Qualquer" })).status === 404);

  console.log("\nLimpeza (DELETE) e cascata");
  check("DELETE /products/:id -> 200", (await call("DELETE", `/products/${productId}`)).status === 200);
  check("DELETE /products/:id novamente -> 404", (await call("DELETE", `/products/${productId}`)).status === 404);
  check("DELETE /users/:id -> 200", (await call("DELETE", `/users/${userId}`)).status === 200);
  check("DELETE /productsituations/:id -> 200", (await call("DELETE", `/productsituations/${productSituationId}`)).status === 200);
  check("DELETE /productcategories/:id -> 200", (await call("DELETE", `/productcategories/${productCategoryId}`)).status === 200);

  const cascadeUser = await call("POST", "/users", { ...userBody, email: `cascade-${email}` });
  const cascadeUserId = cascadeUser.body.user?.id;
  check("DELETE /situations/:id -> 200", (await call("DELETE", `/situations/${situationId}`)).status === 200);
  check("Usuário da Situation removida some (CASCADE)", (await call("GET", `/users/${cascadeUserId}`)).status === 404);

  console.log(`\n${passed} ok, ${failed} falha(s)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
