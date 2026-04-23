import type { IncludeName, Replacer } from './const';

import { minifyGLSL } from './minify-glsl';

const shaderRegex = /^((?:const|var) ([a-z0-9$_]+) = )"(.+)"/gm;
const inlineShaderRegex = /\/\* glsl \*\/`([^]+?)`/g;

const escapedNewlineRegex = /\\n/g;
const escapedTabRegex = /\\t/g;

const inlineShaderReplacer: Replacer = (_, glsl) => {
  return `/* glsl */\`${minifyGLSL(glsl)}\``;
};

/**
 * Minify GLSL code
 * @param code code
 * @param discardIncludes Set of includes to discard
 * @returns `code` (modified)
 */
export function minifyShaders(
  code: string,
  discardIncludes: Set<IncludeName>,
): string {
  /**
   * Minify GLSL code (skipping shader chunks that we know will be discarded)
   * @param match `$&`
   * @param declaration Declaration of include variable (`$1`)
   * @param include Name of the include variable (`$2`)
   * @param glsl GLSL shader code (`$3`)
   * @returns The minified GLSL shader
   */
  const shaderReplacer: Replacer = (match, declaration, include, glsl) => {
    if (discardIncludes.has(include as IncludeName)) return match;

    return `${declaration}\`${minifyGLSL(
      glsl.replace(escapedNewlineRegex, '\n').replace(escapedTabRegex, ' '),
    )}\``;
  };

  code = code.replace(shaderRegex, shaderReplacer);

  /** Minify inline shader code */
  code = code.replace(inlineShaderRegex, inlineShaderReplacer);

  return code;
}
