const dummyWebGLShadowMap = `
function WebGLShadowMap() {
  return {
    enabled: false,
    render: function() {},
  };
}
`;

/**
 * Replaces `WebGLShadowMap` with a dummy.
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(
    /^function WebGLShadowMap.+{[\s\S]+?^}/m,
    dummyWebGLShadowMap,
  );
}
