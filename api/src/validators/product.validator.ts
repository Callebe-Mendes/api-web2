import * as yup from "yup";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MESSAGE =
  "O slug deve conter apenas letras minúsculas, números e hífens (ex.: meu-produto).";

const foreignKey = (field: string) =>
  yup
    .number()
    .typeError(`O campo '${field}' deve ser um número.`)
    .integer(`O campo '${field}' deve ser um inteiro.`)
    .positive(`O campo '${field}' deve ser positivo.`);

export const createProductSchema = yup.object({
  name: yup
    .string()
    .required("O campo 'name' é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: yup
    .string()
    .required("O campo 'slug' é obrigatório.")
    .matches(SLUG_PATTERN, SLUG_MESSAGE),
  productSituationId: foreignKey("productSituationId").required(
    "O campo 'productSituationId' é obrigatório."
  ),
  productCategoryId: foreignKey("productCategoryId").required(
    "O campo 'productCategoryId' é obrigatório."
  ),
});

export const updateProductSchema = yup.object({
  name: yup.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: yup.string().matches(SLUG_PATTERN, SLUG_MESSAGE),
  productSituationId: foreignKey("productSituationId"),
  productCategoryId: foreignKey("productCategoryId"),
});
