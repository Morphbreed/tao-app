/**
 * Folds a string for comparison: case, umlauts and ß are levelled so that
 * "fuehren" finds "führen" and the other way round. Umlauts are spelled out
 * before the remaining diacritics are stripped — otherwise "ü" would collapse
 * to "u" and the spelled-out form would no longer match.
 */
export function fold(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
