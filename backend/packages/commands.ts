/** Placeholders que se pueden usar dentro de los comandos de un paquete. */
export const COMMAND_PLACEHOLDERS = {
  player: "%p%",
  amount: "%am%",
} as const;

export const MAX_COMMANDS_PER_PACKAGE = 30;
export const MAX_COMMAND_LENGTH = 512;

/**
 * Nombres de jugador aceptados: letras, números, guion bajo y punto (Bedrock/Floodgate).
 * Sin espacios ni símbolos, porque el nombre se inserta tal cual en comandos de consola:
 * un nombre como "Steve op Steve" permitiría inyectar argumentos.
 */
const PLAYER_NAME_PATTERN = /^[A-Za-z0-9_.]{1,32}$/;

export function isValidPlayerName(value: string): boolean {
  return PLAYER_NAME_PATTERN.test(value);
}

export interface CommandContext {
  playerName: string;
  amount: string;
}

/** Reemplaza los placeholders de un comando: %p% → jugador, %am% → monto pagado. */
export function renderCommand(template: string, context: CommandContext): string {
  return template
    .replaceAll(COMMAND_PLACEHOLDERS.player, context.playerName)
    .replaceAll(COMMAND_PLACEHOLDERS.amount, context.amount);
}

/**
 * Normaliza la lista de comandos que llega del formulario: quita espacios, la "/" inicial
 * (se ejecutan desde consola) y las líneas vacías. Devuelve un error si algo no es válido.
 */
export function normalizeCommands(value: unknown): { commands: string[] } | { error: string } {
  if (!Array.isArray(value)) {
    return { error: "commands debe ser una lista de comandos." };
  }

  const commands: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      return { error: "Cada comando debe ser texto." };
    }

    const command = item.trim().replace(/^\/+/, "");

    if (!command) continue;

    if (command.length > MAX_COMMAND_LENGTH) {
      return { error: `Cada comando puede tener como máximo ${MAX_COMMAND_LENGTH} caracteres.` };
    }

    if (/[\r\n]/.test(command)) {
      return { error: "Un comando no puede tener saltos de línea." };
    }

    commands.push(command);
  }

  if (commands.length === 0) {
    return { error: "El paquete necesita al menos un comando." };
  }

  if (commands.length > MAX_COMMANDS_PER_PACKAGE) {
    return { error: `Un paquete puede tener como máximo ${MAX_COMMANDS_PER_PACKAGE} comandos.` };
  }

  return { commands };
}
