/**
 * Removes color keywords like "red", "green", and "blue".
 * This removes the ability to create colors like `THREE.Color('red')`
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  const colorKeywords = /colorKeywords = {([\s\S]+?)};/.exec(code);

  if (colorKeywords === null) {
    console.error('colorKeywords not found! Skipping...');
    return code;
  }

  return code.replace(colorKeywords[1], '');
}
