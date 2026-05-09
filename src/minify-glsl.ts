import type { Replacer } from './const';

/** Matches all GLSL comments */
const commentsRegex = /(\/\*[^]+?\*\/|\/\/.*)/gm;

/** Matches floats with redundant leading or trailing zero (like 0.1 or 1.0) */
const redundantZeroesRegex = /(\D)0(\.\d+)|(\d+\.)0(\D)/g;

/**
 * Remove redundant zeroes in floats
 * @param _ `$&`
 * @param a Leading non-digit (`$1`)
 * @param b Float (fraction part) (`$2`)
 * @param c Float (integer part) (`$3`)
 * @param d Trailing non-digit (`$4`)
 * @returns Float without redundant leading / trailing zero
 */
const redundantZeroReplacer: Replacer = (_, a, b, c, d) => {
  return a && b ? a + b : c + d;
};

/** Matches whitespace around symbols */
const redundantWhitespaceRegex = /\s*([{}=,+/><%^&*|[\]()\-~!?:;])\s*/g;

/** Matches 2 or more consecutive whitespaces */
const consecutiveWhitespaceRegex = /\s{2,}/g;

/** Matches everything except lines beginning with "#" (directives) */
const glslRegex = /^[^#]+$/gm;

const glslReplacer: Replacer = (glsl) => {
  glsl = glsl.trim();
  glsl = glsl.replace(consecutiveWhitespaceRegex, ' ');
  return glsl.replace(redundantWhitespaceRegex, '$1');
};

/** Matches lines beginning with "#" (directives) */
const directiveRegex = /^\s*#((?:el)?if[ \t]+)?(.+)$/gm;

const directiveReplacer: Replacer = (_, conditional, directive) => {
  directive = directive.replace(consecutiveWhitespaceRegex, ' ');

  return conditional
    ? `#${conditional}${directive.replace(redundantWhitespaceRegex, '$1')}`
    : `#${directive}`;
};

/**
 * Minify GLSL code
 * @param glsl GLSL code
 * @returns Minified GLSL code
 */
export function minifyGLSL(glsl: string): string {
  glsl = glsl.replace(commentsRegex, '');
  glsl = glsl.replace(redundantZeroesRegex, redundantZeroReplacer);
  glsl = glsl.replace(glslRegex, glslReplacer);
  glsl = glsl.replace(directiveRegex, directiveReplacer);

  return glsl;
}
