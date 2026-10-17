import { Request, Response } from "express";
import { Not } from "typeorm";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Situation } from "../entities/Situation";
import { requireId, sendPaginatedList } from "../shared/http";
import { handleValidationError } from "../shared/validation";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator";

const PASSWORD_SALT_ROUNDS = 10;

export class UserController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      await sendPaginatedList(
        req,
        res,
        AppDataSource.getRepository(User),
        "users",
        { situation: true }
      );
    } catch {
      res.status(500).json({
        mensagem: "Erro ao listar usuário!",
      });
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    try {
      const id = requireId(req, res);
      if (id === null) return;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        relations: { situation: true },
      });

      if (!user) {
        res.status(404).json({
          mensagem: "Usuário não encontrado!",
        });
        return;
      }

      res.status(200).json(user);
    } catch {
      res.status(500).json({
        mensagem: "Erro ao visualizar usuário!",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      await createUserSchema.validate(req.body, { abortEarly: false });

      const { name, email, password, situationId } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const situation = await AppDataSource.getRepository(Situation).findOneBy({
        id: situationId,
      });
      if (!situation) {
        res.status(400).json({
          mensagem: "A situação informada não existe.",
        });
        return;
      }

      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        res.status(409).json({
          mensagem: "Já existe um usuário com este e-mail.",
        });
        return;
      }

      const newUser = userRepository.create({
        name,
        email,
        situationId,
        password: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS),
      });
      await userRepository.save(newUser);

      const user = await userRepository.findOne({
        where: { id: newUser.id },
        relations: { situation: true },
      });

      res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        user,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao cadastrar usuário!",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      await updateUserSchema.validate(req.body, { abortEarly: false });

      const id = requireId(req, res);
      if (id === null) return;
      const { name, email, password, situationId } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOneBy({ id });
      if (!user) {
        res.status(404).json({
          mensagem: "Usuário não encontrado!",
        });
        return;
      }

      if (situationId !== undefined) {
        const situation = await AppDataSource.getRepository(
          Situation
        ).findOneBy({ id: situationId });
        if (!situation) {
          res.status(400).json({
            mensagem: "A situação informada não existe.",
          });
          return;
        }
      }

      if (email) {
        const existingUser = await userRepository.findOne({
          where: { email, id: Not(id) },
        });
        if (existingUser) {
          res.status(409).json({
            mensagem: "Já existe outro usuário com este e-mail.",
          });
          return;
        }
      }

      userRepository.merge(user, { name, email, situationId });
      if (password) {
        user.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
      }
      await userRepository.save(user);

      const updatedUser = await userRepository.findOne({
        where: { id },
        relations: { situation: true },
      });

      res.status(200).json({
        mensagem: "Usuário atualizado com sucesso!",
        user: updatedUser,
      });
    } catch (error) {
      if (handleValidationError(error, res)) {
        return;
      }

      res.status(500).json({
        mensagem: "Erro ao atualizar usuário!",
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = requireId(req, res);
      if (id === null) return;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id });

      if (!user) {
        res.status(404).json({
          mensagem: "Usuário não encontrado!",
        });
        return;
      }

      await userRepository.remove(user);

      res.status(200).json({
        mensagem: "Usuário removido com sucesso!",
      });
    } catch {
      res.status(500).json({
        mensagem: "Erro ao remover usuário!",
      });
    }
  }
}
