const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*+-=?";

function randomIndex(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function pickChar(charset: string): string {
  return charset[randomIndex(charset.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [array[index], array[swapIndex]] = [array[swapIndex]!, array[index]!];
  }
  return array;
}

/** Mot de passe aléatoire : majuscules, minuscules, chiffres, symboles. */
export function generateRobustPassword(length = 16): string {
  const size = Math.max(12, length);
  const all = LOWER + UPPER + DIGITS + SPECIAL;

  const chars = shuffle([
    pickChar(LOWER),
    pickChar(UPPER),
    pickChar(DIGITS),
    pickChar(SPECIAL),
    ...Array.from({ length: size - 4 }, () => pickChar(all)),
  ]);

  return chars.join("");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
