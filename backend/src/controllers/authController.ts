import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { signToken } from '../middleware/auth';

export class AuthController {
  constructor(private users: UserModel) {}

  register = (req: Request, res: Response): void => {
    const { email, password, role } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    if (this.users.findByEmail(email)) {
      res.status(409).json({ error: 'A user with that email already exists' });
      return;
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const safeRole = role === 'admin' ? 'admin' : 'user';
    const user = this.users.create({ email, password_hash, role: safeRole });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  };

  login = (req: Request, res: Response): void => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const user = this.users.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  };
}
