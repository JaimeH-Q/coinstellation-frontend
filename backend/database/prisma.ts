import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword, verifyPassword } from "../auth/password";
import type {
  RegisterUserData,
  UpdateUserData,
  User,
  UserCredentials,
} from "../users/UserRegister";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;

export class PrismaUserDatabase {
  async register(data: RegisterUserData): Promise<User> {
    const email = this.normalizeEmail(data.email);

    try {
      const user = await prisma.user.create({
        data: {
          name: data.name.trim(),
          email,
          passwordHash: await hashPassword(data.password),
        },
      });

      return this.toUser(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new Error("A user with that email already exists.");
      }

      throw error;
    }
  }

  async existsById(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    return user !== null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
      select: { id: true },
    });

    return user !== null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });

    return user ? this.toUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });

    return user ? this.toUser(user) : null;
  }

  async verifyCredentials(
    credentials: UserCredentials,
  ): Promise<User | null> {
    const user = await this.findByEmail(credentials.email);

    if (!user) {
      return null;
    }

    const { valid, needsRehash } = await verifyPassword(credentials.password, user.passwordHash);

    if (!valid) {
      return null;
    }

    if (needsRehash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(credentials.password) },
      });
    }

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const updateData = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.email !== undefined ? { email: this.normalizeEmail(data.email) } : {}),
      ...(data.password !== undefined
        ? { passwordHash: await hashPassword(data.password) }
        : {}),
    };

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return this.toUser(user);
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        return null;
      }

      if (this.isUniqueConstraintError(error)) {
        throw new Error("A user with that email already exists.");
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await prisma.user.deleteMany({ where: { id } });

    return result.count > 0;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUser(user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return this.isPrismaErrorCode(error, "P2002");
  }

  private isRecordNotFoundError(error: unknown): boolean {
    return this.isPrismaErrorCode(error, "P2025");
  }

  private isPrismaErrorCode(error: unknown, code: string): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === code
    );
  }
}

export const prismaUserDatabase = new PrismaUserDatabase();