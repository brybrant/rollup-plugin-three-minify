import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for shadow maps has been removed.
If you wish to use shadow maps then you must include the "shadows" feature or "shadow" material in the plugin options.`);

/**
 * @param debug Emit console warning?
 * @returns `WebGLShadowMap` stub
 */
export const WebGLShadowMap = (debug: Options['debug']) => `
function WebGLShadowMap() {
  return {
    enabled: false,
    render: function (${debug ? ' shadows ' : ''}) {
      ${
        debug
          ? `
        if ( shadows.length > 0 ) {
          console.warn(${warning});
          this.render = function () {};
        }`
          : ''
      }
    },
  };
}
`;
