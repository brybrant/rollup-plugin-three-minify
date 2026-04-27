import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for morph targets has been removed.
If you wish to use morph targets then you must include the "morphtargets" feature in the plugin options.`);

/**
 * @param debug Emit console warning?
 * @returns `WebGLMorphtargets` stub
 */
export const WebGLMorphtargets = (debug: Options['debug']) => `
function WebGLMorphtargets() {
  return {
    update: function () {${
      debug ? `console.warn(${warning}); this.update = function () {};` : ''
    }},
  };
}
`;
