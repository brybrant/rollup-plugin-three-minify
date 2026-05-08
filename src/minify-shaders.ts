import type { IncludeName, Replacer } from './const';

import {
  recordIdentifiers,
  countIdentifiers,
  createIdentifiers,
  mangleIdentifiers,
} from './mangler';

import { minifyGLSL } from './minify-glsl';

/**
 * Capture group 1: inline GLSL
 * Capture group 2: `IncludeName`
 * capture group 3: include GLSL (has escaped newlines and tabs)
 */
const shaderRegex =
  /\/\* glsl \*\/`([^]+?)`|^(?:const|var) ([a-z0-9$_]+) = "(.+)"/gm;

const escapedNewlineRegex = /\\n/g;
const escapedTabRegex = /\\t/g;

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
  recordIdentifiers(code);

  /**
   * Count mutable identifiers in each shader chunk
   * @param match `$&`
   * @param inline Inline GLSL (`$1`)
   * @param name Include variable name (`$2`)
   * @param include Include GLSL code (`$3`)
   * @returns GLSL (unmodified)
   */
  const identifierCounter: Replacer = (match, inline, name, include) => {
    if (inline) return countIdentifiers(inline);

    /** Skip shader chunks that we know will be discarded via treeshaking */
    if (discardIncludes.has(name as IncludeName)) return match;

    return countIdentifiers(include);
  };

  code.replace(shaderRegex, identifierCounter);

  createIdentifiers();

  /**
   * Minify by removing redundant whitespace and mangling mutable identifiers
   * @param match `$&`
   * @param inline Inline GLSL (`$1`)
   * @param name Include variable name (`$2`)
   * @param include Include GLSL code (`$3`)
   * @returns GLSL (minified)
   */
  const shaderMinifier: Replacer = (match, inline, name, include) => {
    if (inline) {
      return `/* glsl */\`${mangleIdentifiers(minifyGLSL(inline))}\``;
    }

    /** Skip shader chunks that we know will be discarded via treeshaking */
    if (discardIncludes.has(name as IncludeName)) return match;

    include = minifyGLSL(
      include.replace(escapedNewlineRegex, '\n').replace(escapedTabRegex, ' '),
    );

    return `const ${name} = \`${mangleIdentifiers(include)}\``;
  };

  code = code.replace(shaderRegex, shaderMinifier);

  return code;
}
