import type { Replacer } from './const';
import type { Options } from './options';

import { WebGLBackground } from './stubs/background';
import { WebGLClipping } from './stubs/clipping';
import { WebGLCubeMaps } from './stubs/cubemaps';
import { WebGLCubeUVMaps } from './stubs/cubeuvmaps';
import { WebGLEnvironments } from './stubs/environments';
import { WebGLLights } from './stubs/lights';
import { WebGLMorphtargets } from './stubs/morphtargets';
import { WebGLShadowMap } from './stubs/shadowmap';
import { WebGLTextures } from './stubs/textures';
import { WebXRManager } from './stubs/xr';

/** Matches all WebGL subsystems (and `WebXRManager`) */
const subsystemRegex = /^(?:function|class) Web(GL|XR)([a-zA-Z]+)[^]+?^}/gm;

/**
 * Prunes redundant subsystems of `WebGLRenderer`.
 * Redundant subsystems are determined by flags set in the `options` object.
 * @param code code
 * @param options User options
 * @returns `code` (modified)
 */
export function pruneSubsystems(code: string, options: Options): string {
  /**
   * Replaces each redundant subsystem with a stub
   * @param match `$&`
   * @param type Type of subsystem (`GL` or `XR`) (`$1`)
   * @param subsystem Subsystem code (`$2`)
   * @returns Subsystem stub or `match`
   */
  const subsystemReplacer: Replacer = (match, type, subsystem) => {
    if (type === 'XR') {
      if (subsystem === 'Manager' && !options.xr) return WebXRManager;
      return match;
    }

    /** `type` is `GL` */
    switch (subsystem) {
      case 'Background':
        if (!options.subsystems.background) return WebGLBackground;
        break;

      case 'Clipping':
        if (!options.subsystems.clipping) return WebGLClipping;
        break;

      case 'CubeUVMaps':
        if (!options.subsystems.environments) return WebGLCubeUVMaps;
        break;

      case 'CubeMaps':
        if (!options.subsystems.environments) return WebGLCubeMaps;
        break;

      case 'Environments':
        if (!options.subsystems.environments) return WebGLEnvironments;
        break;

      case 'Lights':
        if (!options.subsystems.lights) return WebGLLights;
        break;

      case 'Morphtargets':
        if (!options.subsystems.morphtargets) return WebGLMorphtargets;
        break;

      case 'ShadowMap':
        if (!options.subsystems.shadowmap) return WebGLShadowMap;
        break;

      case 'Textures':
        if (!options.subsystems.textures) return WebGLTextures;
        break;

      default:
        return match;
    }

    return match;
  };

  return code.replace(subsystemRegex, subsystemReplacer);
}
