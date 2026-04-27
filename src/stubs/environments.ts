import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for environment maps has been removed.
If you wish to use environment maps then you must include the "envmap" feature in the plugin options.`);

type System = 'CubeMaps' | 'CubeUVMaps' | 'Environments';

/**
 * This stub should also treeshake `PMREMGenerator` from the bundle.
 * @param debug Emit console warning?
 * @param system {@link System}
 * @returns `WebGLEnvironments` stub
 */
export const WebGLEnvironments = (debug: Options['debug'], system: System) => `
function WebGL${system}() {
  return {
    get: function (${debug ? ' texture ' : ''}) {
      ${
        debug
          ? `
      if ( texture ) {
        console.warn(${warning});
        this.get = function () { return null };
      }`
          : ''
      }
      return null;
    },
    dispose: function () {},
  };
}
`;
