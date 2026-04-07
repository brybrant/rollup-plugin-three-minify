const dummyWebXRManager = `
class WebXRManager extends EventDispatcher {
  constructor() {
    super();
    this.enabled = false;
    this.isPresenting = false;
    this.dispose =
      this.setAnimationLoop =
      this.hasDepthSensing =
      this.getEnvironmentBlendMode =
        function () {};
  }
}
`;

/**
 * Replaces `WebXRManager` with a dummy.
 * This should also treeshake the following from the bundle:
 * - `WebXRController`
 * - `WebXRDepthSensing`
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(/^class WebXRManager.+{[\s\S]+?^}/m, dummyWebXRManager);
}
