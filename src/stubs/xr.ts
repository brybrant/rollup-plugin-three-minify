import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for WebXR has been removed.
If you wish to use WebXR then you must set the "xr" property in the plugin options to "true".`);

/**
 * This stub should also treeshake the following from the bundle:
 * - `WebXRController`
 * - `WebXRDepthSensing`
 * @param debug Emit console warning?
 * @returns `WebXRManager` stub
 */
export const WebXRManager = (debug: Options['debug']) => `
class WebXRManager extends EventDispatcher {
  constructor() {
    super();
    this.dispose =
      this.setAnimationLoop =
      this.hasDepthSensing =
      this.getEnvironmentBlendMode =
        function () {};
  }

  get enabled() { return false }
  
  set enabled(bool) {${debug ? `if (bool) console.warn(${warning})` : ''}}

  get isPresenting() { return false }

  set isPresenting(bool) {}
}
`;
