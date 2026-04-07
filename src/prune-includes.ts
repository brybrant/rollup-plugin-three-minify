import type { IncludeName } from './const';

/**
 * Removes unwanted includes
 * @param code code
 * @param ShaderChunk `ShaderChunk`
 * @param unwantedIncludes Array of includes to remove
 * @returns `[ code, ShaderChunk ]` (modified)
 */
export default function (
  code: string,
  ShaderChunk: string,
  unwantedIncludes: IncludeName[],
): [string, string] {
  const includesGroup = `(${unwantedIncludes.join('|')})`;

  return [
    /** Removes `#include <shader>` directives of unwanted includes */
    code.replace(new RegExp(`#include <${includesGroup}>`, 'g'), ''),
    /**
     * Removes unwanted includes from `THREE.ShaderChunk`.
     * This should also treeshake the includes' GLSL code from the bundle.
     */
    ShaderChunk.replace(
      new RegExp(`^\\s+${includesGroup}: \\w+,?\\n`, 'gm'),
      '',
    ),
  ];
}
