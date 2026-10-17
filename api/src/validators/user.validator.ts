import * as yup from "yup";

export const createUserSchema = yup.object({
  name: yup
    .string()
    .required("O campo 'name' é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  email: yup
    .string()
    .required("O campo 'email' é obrigatório.")
    .email("O e-mail informado é inválido."),
  password: yup
    .string()
    .required("O campo 'password' é obrigatório.")
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
  situationId: yup
    .number()
    .typeError("O campo 'situationId' deve ser um número.")
    .required("O campo 'situationId' é obrigatório.")
    .integer("O campo 'situationId' deve ser um inteiro.")
    .positive("O campo 'situationId' deve ser positivo."),
});

export const updateUserSchema = yup.object({
  name: yup.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  email: yup.string().email("O e-mail informado é inválido."),
  password: yup.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  situationId: yup
    .number()
    .typeError("O campo 'situationId' deve ser um número.")
    .integer("O campo 'situationId' deve ser um inteiro.")
    .positive("O campo 'situationId' deve ser positivo."),
});
