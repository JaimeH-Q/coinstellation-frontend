/** Activos con los que se puede cobrar un paquete. */
export const PACKAGE_CURRENCIES = ["XLM", "USDC"] as const;
export type PackageCurrency = (typeof PACKAGE_CURRENCIES)[number];

export interface PackageCategoryDTO {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface PackageDTO {
  id: string;
  categoryId: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  price: string;
  currency: string;
  /** Solo se incluye para el dueño (sesión del dashboard), nunca para las tiendas. */
  commands?: string[];
  createdAt: string;
}

export interface GameServerDTO {
  name: string;
  lastSeenAt: string | null;
  createdAt: string;
  /** Comandos pagados que el plugin todavía no confirmó. */
  pendingCommands: number;
}
