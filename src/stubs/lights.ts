import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for lights has been removed.
If you wish to use lights then you must include the "lights" feature or at least one of the following materials in the plugin options:
- "lambert"
- "phong"
- "shadow"
- "standard"
- "toon"`);

/**
 * @param debug Emit console warning?
 * @returns `WebGLLights` stub
 */
export const WebGLLights = (debug: Options['debug']) => `
function WebGLLights() {
  const state = {
    get version() { return 0 },
    set version(number) {},
    ambient: [ 0, 0, 0 ],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0,
  };

  return {
    setup: function (${debug ? ' lights ' : ''}) {
      ${
        debug
          ? `
        if ( lights.length > 0 ) {
          console.warn(${warning});
          this.setup = function () {};
        }`
          : ''
      }
    },
    setupView: function () {},
    state: state,
  };
}
`;
