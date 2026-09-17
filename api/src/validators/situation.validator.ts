import * as yup from "yup";

export const createSituationSchema = yup.object({
  nameSituation: yup
    .string()
    .required("O campo 'nameSituation' é obrigatório.")
    .min(3, "O nome da situação deve ter no mínimo 3 caracteres."),
});

export const updateSituationSchema = yup.object({
  nameSituation: yup
    .string()
    .min(3, "O nome da situação deve ter no mínimo 3 caracteres."),
});
