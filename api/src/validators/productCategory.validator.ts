import * as yup from "yup";

export const createProductCategorySchema = yup.object({
  name: yup
    .string()
    .required("O campo 'name' é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
});

export const updateProductCategorySchema = yup.object({
  name: yup.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
});
