const dummyWebGLClipping = `
function WebGLClipping() {
  return {
    numPlanes: 0,
    numIntersection: 0,
    uniform: {
      value: null,
      needsUpdate: false,
    },
    init: function() { return false },
  };
}
`;

/**
 * Replaces `WebGLClipping` with a dummy.
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(
    /^function WebGLClipping.+{[\s\S]+?^}/m,
    dummyWebGLClipping,
  );
}
