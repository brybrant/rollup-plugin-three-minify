import type { IncludeName, MaterialName } from './const';

import pruneIncludes from './prune-includes';
import pruneMaterials from './prune-materials';

/**
 * Remove unwanted includes and materials
 * @param code code
 * @param keepMaterials Set of material shaders to keep
 * @param keepShaders Array of shader chunks to keep
 * @param unwantedIncludes Array of includes to remove
 * @returns `code` (modified)
 */
export default function (
  code: string,
  keepMaterials: Set<MaterialName>,
  keepShaders: string[],
  unwantedIncludes: IncludeName[],
): string {
  const ShaderChunk = /^const ShaderChunk = {[\s\S]+?^};/m.exec(code);

  if (ShaderChunk === null) {
    console.error('ShaderChunk not found! Skipping shader compression...');
    return code;
  }

  /** A mutable copy of `THREE.ShaderChunk` */
  let newShaderChunk = ShaderChunk[0];

  /** Remove unwanted includes */
  [code, newShaderChunk] = pruneIncludes(
    code,
    newShaderChunk,
    unwantedIncludes,
  );

  const ShaderLib = /^const ShaderLib = {[\s\S]+?^};/m.exec(code);

  if (ShaderLib === null) {
    console.error('ShaderLib not found! Skipping material compression...');
    return code.replace(ShaderChunk[0], newShaderChunk);
  }

  /** A mutable copy of `THREE.ShaderLib` */
  let newShaderLib = ShaderLib[0];

  /**
   * Remove unwanted materials.
   * Adds wanted materials to `keepShaders` array for later compressing.
   */
  [code, newShaderChunk, newShaderLib] = pruneMaterials(
    code,
    newShaderChunk,
    newShaderLib,
    keepMaterials,
    keepShaders,
  );

  return code
    .replace(ShaderChunk[0], newShaderChunk)
    .replace(ShaderLib[0], newShaderLib);
}
