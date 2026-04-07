const dummyWebGLEnvironments = `
function WebGLEnvironments() {
  return {
    get: function() { return null },
    dispose: function() {},
  };
}
`;

/**
 * Replaces `WebGLEnvironments` with a dummy.
 * This should also treeshake `PMREMGenerator` from the bundle.
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(
    /^function WebGLEnvironments.+{[\s\S]+?^}/m,
    dummyWebGLEnvironments,
  );
}
