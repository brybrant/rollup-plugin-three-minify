import type { IncludeName, MaterialName, Replacer } from './const';

import type { Options } from './options';

/** Matches entries in `ShaderLib` */
const materialRegex =
  /^(\s+)(\w+): {[^]+?ShaderChunk\.([a-zA-Z]+)[^]+?^\1},?/gm;

/** Matches entries in `ShaderChunk` */
const includeRegex = /\s+(\w+):.+/g;

/**
 * Remove redundant includes and materials from `ShaderChunk` and `ShaderLib`.
 *
 * This should also treeshake redundant GLSL code declarations from the bundle.
 * @param code code
 * @param keepMaterials Set of material shaders to keep
 * @param discardIncludes Set of includes to discard
 * @returns `code` (modified)
 */
export function pruneShaders(
  code: string,
  keepMaterials: Options['materials'],
  discardIncludes: Set<IncludeName>,
): string {
  const discardShaderChunks: Set<string> = new Set(discardIncludes);

  /**
   * Removes redundant materials from `ShaderLib` & adds their respective keys
   * of `ShaderChunk` to `discardShaderChunks` for later removal.
   * @param match `$&`
   * @param indent *used only for backreference within the regex* (`$1`)
   * @param material Material (key of `ShaderLib`) (`$2`)
   * @param key Material (key of `ShaderChunk`) (`$3`)
   * @returns `match` if `material` in `keepMaterials`, otherwise empty string
   */
  const materialReplacer: Replacer = (match, indent, material, key) => {
    if (keepMaterials.has(material as MaterialName)) return match;

    discardShaderChunks.add(`${key}_vert`).add(`${key}_frag`);

    return '';
  };

  code = code.replace(
    /ShaderLib =[^]+ShaderLib\.physical =[^]+?\n};/,
    (ShaderLib) => {
      ShaderLib = ShaderLib.replace(materialRegex, materialReplacer);

      if (keepMaterials.has('physical')) return ShaderLib;

      /**
       * Standard & Physical materials use the same vertex & fragment shaders,
       * therefore `discardShaderChunks` must already contain physical
       */
      return ShaderLib.replace(/ShaderLib\.physical =[^]+/, '');
    },
  );

  /**
   * Removes redundant entries from `ShaderChunk`
   * @param match `$&`
   * @param key key of `ShaderChunk` (`$1`)
   * @returns empty string if `key` in `discardShaderChunks`, otherwise `match`
   */
  const includeReplacer: Replacer = (match, key) => {
    return discardShaderChunks.has(key) ? '' : match;
  };

  code = code.replace(/ShaderChunk =[^]+?\n};/, (ShaderChunk) => {
    return ShaderChunk.replace(includeRegex, includeReplacer);
  });

  return code.replace(
    new RegExp(`#include <(${[...discardIncludes].join('|')})>`, 'g'),
    '',
  );
}
