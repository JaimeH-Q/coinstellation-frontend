import prisma from "../database/prisma";
import { normalizeCommands } from "./commands";
import {
  PACKAGE_CURRENCIES,
  type PackageCategoryDTO,
  type PackageCurrency,
  type PackageDTO,
} from "./PackageTypes";

/** Imágenes subidas como data URL: se limita el tamaño porque se guardan en la base. */
const MAX_IMAGE_LENGTH = 2_000_000;
const PRICE_PATTERN = /^\d+(\.\d{1,7})?$/;

type ParseResult<T> = { data: T } | { error: string };

export interface PackageInput {
  name: string;
  description: string;
  imageUrl: string | null;
  price: string;
  currency: PackageCurrency;
  categoryId: string | null;
  commands: string[];
}

export interface CategoryInput {
  name: string;
  description: string | null;
  imageUrl: string | null;
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseImage(value: unknown): ParseResult<string | null> {
  const image = optionalText(value);

  if (image === null) return { data: null };

  if (image.length > MAX_IMAGE_LENGTH) {
    return { error: "La imagen es demasiado grande (máx. ~1.5 MB)." };
  }

  if (!/^https?:\/\//i.test(image) && !/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(image)) {
    return { error: "La imagen debe ser una URL http(s) o un archivo PNG, JPG, GIF o WEBP." };
  }

  return { data: image };
}

export function parsePackageInput(body: Record<string, unknown>): ParseResult<PackageInput> {
  const name = optionalText(body.name);
  const description = optionalText(body.description);
  const price = typeof body.price === "string" ? body.price.trim() : "";
  const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "XLM";

  if (!name || name.length > 100) {
    return { error: "El nombre es obligatorio (máx. 100 caracteres)." };
  }

  if (!description || description.length > 2000) {
    return { error: "La descripción es obligatoria (máx. 2000 caracteres)." };
  }

  if (!PRICE_PATTERN.test(price) || Number(price) <= 0) {
    return { error: "El precio debe ser un número mayor a 0 con hasta 7 decimales." };
  }

  if (!PACKAGE_CURRENCIES.includes(currency as PackageCurrency)) {
    return { error: `El activo debe ser uno de: ${PACKAGE_CURRENCIES.join(", ")}.` };
  }

  const image = parseImage(body.imageUrl);
  if ("error" in image) return image;

  const commands = normalizeCommands(body.commands);
  if ("error" in commands) return commands;

  return {
    data: {
      name,
      description,
      imageUrl: image.data,
      price,
      currency: currency as PackageCurrency,
      categoryId: optionalText(body.categoryId),
      commands: commands.commands,
    },
  };
}

export function parseCategoryInput(body: Record<string, unknown>): ParseResult<CategoryInput> {
  const name = optionalText(body.name);

  if (!name || name.length > 100) {
    return { error: "El nombre de la categoría es obligatorio (máx. 100 caracteres)." };
  }

  const image = parseImage(body.imageUrl);
  if ("error" in image) return image;

  return { data: { name, description: optionalText(body.description), imageUrl: image.data } };
}

/** Paquetes del usuario. Los comandos solo se incluyen si `includeCommands` (dueño del dashboard). */
export async function listPackages(
  userId: string,
  { includeCommands }: { includeCommands: boolean },
): Promise<PackageDTO[]> {
  const rows = await prisma.package.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: includeCommands ? { commands: { orderBy: { position: "asc" } } } : undefined,
  });

  return rows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    price: row.price,
    currency: row.currency,
    ...("commands" in row && Array.isArray(row.commands)
      ? { commands: row.commands.map((command) => command.command) }
      : {}),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listCategories(userId: string): Promise<PackageCategoryDTO[]> {
  const rows = await prisma.packageCategory.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Crea el paquete con sus comandos. Devuelve null si la categoría no es del usuario. */
export async function createPackage(userId: string, input: PackageInput): Promise<PackageDTO | null> {
  if (input.categoryId) {
    const category = await prisma.packageCategory.findFirst({
      where: { id: input.categoryId, userId },
      select: { id: true },
    });

    if (!category) return null;
  }

  const row = await prisma.package.create({
    data: {
      userId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      currency: input.currency,
      commands: {
        create: input.commands.map((command, position) => ({ command, position })),
      },
    },
  });

  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    price: row.price,
    currency: row.currency,
    commands: input.commands,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Borra un paquete del usuario. Los pagos anteriores conservan su nombre en packageName. */
export async function deletePackage(userId: string, id: string): Promise<boolean> {
  const result = await prisma.package.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

export async function createCategory(userId: string, input: CategoryInput): Promise<PackageCategoryDTO> {
  const row = await prisma.packageCategory.create({ data: { userId, ...input } });

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Borra la categoría; sus paquetes quedan sin categoría (no se borran). */
export async function deleteCategory(userId: string, id: string): Promise<boolean> {
  const result = await prisma.packageCategory.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

/** Paquete con sus comandos, solo si pertenece al usuario. */
export async function findPackageWithCommands(userId: string, id: string) {
  return prisma.package.findFirst({
    where: { id, userId },
    include: { commands: { orderBy: { position: "asc" } } },
  });
}
