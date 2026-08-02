import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/knex';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';

function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitize(user: Record<string, unknown>) {
  const { password_hash, ...safe } = user;
  void password_hash;
  return safe;
}

const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await db('users').where({ email: data.email }).first();
    if (existing) {
      res.status(409).json({ message: 'Email já cadastrado' });
      return;
    }

    const password_hash = await bcrypt.hash(data.password, 12);
    const [user] = await db('users')
      .insert({ name: data.name, email: data.email, password_hash })
      .returning('*');

    await db('kanban_columns').insert([
      { title: 'A Fazer', position: 0, user_id: user.id },
      { title: 'Em Progresso', position: 1, user_id: user.id },
      { title: 'Concluído', position: 2, user_id: user.id },
    ]);

    res.status(201).json({ token: signToken(user.id), user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await db('users').where({ email: data.email }).first();
    if (!user) {
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    res.json({ token: signToken(user.id), user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await db('users').where({ id: (req as Request & { userId: number }).userId }).first();
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    res.json(sanitize(user));
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(204).send();
}
