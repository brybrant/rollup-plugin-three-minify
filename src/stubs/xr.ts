/**
 * ### `WebXRManager` stub.
 * This should also treeshake the following from the bundle:
 * - `WebXRController`
 * - `WebXRDepthSensing`
 */
export const WebXRManager = `
class WebXRManager extends EventDispatcher {
  constructor() {
    super();
    this.enabled = this.isPresenting = false;
    this.dispose =
      this.setAnimationLoop =
      this.hasDepthSensing =
      this.getEnvironmentBlendMode =
        function () {};
  }
}
`;
