import { materials, type MaterialName, revision } from './const';

const materialNames = Object.keys(materials) as MaterialName[];

if (revision < 146) {
  materialNames.splice(materialNames.indexOf('backgroundCube'), 1);
}

materialNames.splice(
  materialNames.indexOf(revision < 182 ? 'distance' : 'distanceRGBA'),
  1,
);

const ShaderRegex = `[\\s\\S]+?Shader: ShaderChunk\\.([a-zA-Z]+)[\\s\\S]+?`;

/**
 * Removes unwanted materials
 * @param code code
 * @param ShaderChunk A mutable copy of `ShaderChunk`
 * @param ShaderLib A mutable copy of `ShaderLib`
 * @param keepMaterials Set of material shaders to keep
 * @param keepShaders Array of shader chunks to keep
 * @returns `[ code, ShaderChunk, ShaderLib ]` (modified)
 */
export default function (
  code: string,
  ShaderChunk: string,
  ShaderLib: string,
  keepMaterials: Set<MaterialName>,
  keepShaders: string[],
): [string, string, string] {
  /**
   * Adds the variables which store the material's GLSL code to `keepShaders`
   * @param shaderChunkKey Prefix of material key in `ShaderChunk`
   */
  function addToKeepShaders(shaderChunkKey: string) {
    /** Find the variables for this material in ShaderChunk */
    const vertShaderRegex = new RegExp(`${shaderChunkKey}_vert: ([\\w$]+)`);
    const fragShaderRegex = new RegExp(`${shaderChunkKey}_frag: ([\\w$]+)`);

    const materialVertShader = vertShaderRegex.exec(ShaderChunk);
    const materialFragShader = fragShaderRegex.exec(ShaderChunk);

    /**
     * Add the material shader variable names to the array of shader chunks
     * to keep in the bundle. These will later be compressed.
     *
     * Include a backslash to escape the `$` character in the material
     * shader variable names, otherwise it will be interpreted as the
     * special $ regular expression character to match the end of a string.
     */
    if (materialVertShader === null) {
      console.error(
        `Vertex shader for "${shaderChunkKey}" not found! Skipping...`,
      );
    } else {
      keepShaders.push(materialVertShader[1].replace('$', '\\$'));
    }

    if (materialFragShader === null) {
      console.error(
        `Fragment shader for "${shaderChunkKey}" not found! Skipping...`,
      );
    } else {
      keepShaders.push(materialFragShader[1].replace('$', '\\$'));
    }
  }

  /**
   * Delete a material from `ShaderChunk` and `ShaderLib`.
   * This should also treeshake the material's GLSL code from the bundle.
   * @param shaderChunkKey Prefix of material key in `ShaderChunk`
   * @param shaderLibEntry Material entry (key + value) in `ShaderLib`
   */
  function deleteMaterial(shaderChunkKey: string, shaderLibEntry?: string) {
    ShaderChunk = ShaderChunk.replace(
      new RegExp(`^\\s+${shaderChunkKey}_(?:vert|frag):[\\s\\S]+?,?$`, 'gm'),
      '',
    );
    if (shaderLibEntry !== undefined) {
      ShaderLib = ShaderLib.replace(shaderLibEntry, '');
    }
  }

  for (const material of materialNames) {
    /** `ShaderLib.physical` is added after the constant is declared */
    if (material === 'physical') continue;

    const ShaderLibRegex = new RegExp(
      `(^\\s+)${material}: {${ShaderRegex}\\1},?\\n`,
      'm',
    );

    const materialShaderLib = ShaderLibRegex.exec(ShaderLib);

    if (materialShaderLib === null) {
      console.error(
        `Material "${material}" not found in ShaderLib! Skipping...`,
      );
      continue;
    }

    /** Key of material in `ShaderChunk` is stored in capture group `[2]` */
    const materialShaderChunkKey = materialShaderLib[2];

    if (keepMaterials.has(material)) {
      addToKeepShaders(materialShaderChunkKey);

      continue;
    }

    deleteMaterial(materialShaderChunkKey, materialShaderLib[0]);
  }

  /** Deal with 'physical' material separately */
  const PhysicalLibRegex = new RegExp(
    `^ShaderLib.physical = {${ShaderRegex}^};\\n`,
    'm',
  );

  const physicalShaderLib = PhysicalLibRegex.exec(code);

  if (physicalShaderLib === null) {
    console.error(`Material "physical" not found in ShaderLib! Skipping...`);
    return [code, ShaderChunk, ShaderLib];
  }

  /** Key of material in `ShaderChunk` is stored in capture group `[1]` */
  const physicalShaderChunkKey = physicalShaderLib[1];

  if (keepMaterials.has('physical')) {
    addToKeepShaders(physicalShaderChunkKey);
  } else {
    deleteMaterial(physicalShaderChunkKey);
    code = code.replace(physicalShaderLib[0], '');
  }

  return [code, ShaderChunk, ShaderLib];
}
