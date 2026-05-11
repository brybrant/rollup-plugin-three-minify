import { name } from '../package.json';

import type { Plugin } from 'rollup';

import { includes, type IncludeName, revision } from './const';

import { parseOptions, type UserOptions } from './options';

import { pruneSubsystems } from './prune-subsystems';
import { pruneShaders } from './prune-shaders';
import { minifyShaders } from './minify-shaders';

const threeRegex = /\/node_modules\/three\/build\/three\.[\w.]+$/;

/**
 * Minify GLSL code in Three.js and remove redundant `WebGLRenderer` subsystems
 * @param userOptions See [options](./options.ts)
 * @returns Rollup plugin
 */
export default function (userOptions: UserOptions = {}): Plugin {
  return {
    name,
    transform: {
      order: 'pre',
      filter: { id: threeRegex },
      handler(code, id) {
        if (id.endsWith('.min.js')) {
          console.warn(
            `"${name}" does not work with minified versions of Three.js`,
          );
          return null;
        }

        const options = parseOptions(userOptions);

        const webglModule = id.endsWith('three.module.js');

        if (revision < 171 || (revision >= 171 && !webglModule)) {
          if (!options.jsonMethods) {
            /** Remove `toJSON` and `fromJSON` methods on all classes */
            code = code.replace(
              /^(\s+)(static )?(to|from)JSON\(.*\) {[\s\S]+?^\1}/gm,
              '',
            );
          }

          if (!options.colorKeywords) {
            /** Removes color keywords like "red", "green", and "blue" */
            code = code.replace(
              /colorKeywords = {[\s\S]+?};/,
              'colorKeywords = {};',
            );
          }
        }

        if (!webglModule) return { code, map: null };

        code = pruneSubsystems(code, options);

        /**
         * ### Set of Three.js includes to discard from the bundle
         * (Opposite of `Options['includes']`)
         */
        const discardIncludes: Set<IncludeName> = new Set();

        const relevantIncludes = (
          Object.keys(includes) as IncludeName[]
        ).filter((include) => includes[include].status === 'available');

        for (const include of relevantIncludes) {
          if (options.includes.has(include)) continue;
          discardIncludes.add(include);
        }

        code = pruneShaders(code, options.materials, discardIncludes);

        code = minifyShaders(code, discardIncludes);

        return { code, map: null };
      },
    },
  };
}

export type { IncludeName, FeatureName, MaterialName } from './const';
export type { UserOptions } from './options';
