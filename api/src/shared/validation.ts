import { Response } from "express";
import { ValidationError } from "yup";

export function handleValidationError(error: unknown, res: Response): boolean {
  if (!(error instanceof ValidationError)) {
    return false;
  }

  const errors = error.inner.map((err) => ({
    field: err.path,
    message: err.message,
  }));

  res.status(400).json({
    mensagem: "Erro de validação.",
    errors,
  });

  return true;
}
