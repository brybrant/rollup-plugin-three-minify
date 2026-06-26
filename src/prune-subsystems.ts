import type { Replacer, ThreeMetadata } from './const';
import type { Options } from './options';

import { WebGLBackground } from './stubs/background';
import { WebGLClipping } from './stubs/clipping';
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
 * @param metadata Three.js metadata
 * @param options User options
 * @returns `code` (modified)
 */
export function pruneSubsystems(
  code: string,
  metadata: ThreeMetadata,
  options: Options,
): string {
  /**
   * Replaces each redundant subsystem with a stub
   * @param match `$&`
   * @param type Type of subsystem (`GL` or `XR`) (`$1`)
   * @param subsystem Subsystem code (`$2`)
   * @returns Subsystem stub or `match`
   */
  const subsystemReplacer: Replacer = (match, type, subsystem) => {
    if (type === 'XR') {
      if (subsystem === 'Manager' && !options.xr) {
        return WebXRManager(options.debug);
      }
      return match;
    }

    /** `type` is `GL` */
    switch (subsystem) {
      case 'Background':
        if (!options.subsystems.background) {
          return WebGLBackground(options.debug, metadata);
        }
        break;

      case 'Clipping':
        if (!options.subsystems.clipping) {
          return WebGLClipping(options.debug);
        }
        break;

      case 'CubeMaps':
      case 'CubeUVMaps':
      case 'Environments':
        if (!options.subsystems.environments) {
          return WebGLEnvironments(options.debug, subsystem);
        }
        break;

      case 'Lights':
        if (!options.subsystems.lights) {
          return WebGLLights(options.debug);
        }
        break;

      case 'Morphtargets':
        if (!options.subsystems.morphtargets) {
          return WebGLMorphtargets(options.debug);
        }
        break;

      case 'ShadowMap':
        if (!options.subsystems.shadowmap) {
          return WebGLShadowMap(options.debug);
        }
        break;

      case 'Textures':
        if (!options.subsystems.textures) {
          return WebGLTextures(options.debug, metadata);
        }
        break;

      default:
        return match;
    }

    return match;
  };

  return code.replace(subsystemRegex, subsystemReplacer);
}
