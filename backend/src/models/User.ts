import { AppDatabase } from '../db/database';

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface NewUser {
  email: string;
  password_hash: string;
  role?: UserRole;
}

export class UserModel {
  constructor(private db: AppDatabase) {}

  create(user: NewUser): User {
    const stmt = this.db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    );
    const info = stmt.run(user.email, user.password_hash, user.role ?? 'user');
    return this.findById(info.lastInsertRowid as number)!;
  }

  findByEmail(email: string): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;
  }

  findById(id: number): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as User | undefined;
  }
}
