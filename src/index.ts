import { readFile } from 'node:fs/promises';

import { name } from '../package.json';

import type { Plugin } from 'rollup';

import { includes, type IncludeName, revision } from './const';

import { parseOptions, type UserOptions } from './options';

import minifyGLSL from './minify-glsl';
import pruneShaders from './prune-shaders';
import removeBackground from './remove-background';
import removeClipping from './remove-clipping';
import removeColorKeywords from './remove-color-keywords';
import removeEnvironment from './remove-environment';
import removeShadows from './remove-shadows';
import removeTextures from './remove-textures';
import removeXR from './remove-xr';

const threeRegex = /\/node_modules\/three\/build\/three\.[\w.]+$/;

/**
 * Minifies GLSL code in THREE.js and removes unused subsystems of `WebGLRenderer`
 * @param userOptions See [options](./options.ts)
 * @returns Rollup plugin
 */
export default function (userOptions: UserOptions = {}): Plugin {
  const options = parseOptions(userOptions);

  return {
    name,
    load: {
      order: 'pre',
      filter: {
        id: threeRegex,
      },
      async handler(id) {
        if (id.endsWith('.min.js')) {
          console.warn(
            `"${name}" does not work with minified versions of THREE.js`,
          );
          return null;
        }

        const webglModule = id.endsWith('three.module.js');

        let code: string;

        try {
          code = await readFile(id, 'utf8');
        } catch (error) {
          console.error(`\n${JSON.stringify(error)}`);
          return null;
        }

        if (revision < 171 || (revision > 170 && !webglModule)) {
          /** Remove color keywords */
          if (!options.colorKeywords) code = removeColorKeywords(code);

          /** Remove `toJSON` and `fromJSON` methods on all classes */
          if (!options.jsonMethods) {
            code = code.replace(
              /^(\s+)(static\s+)?(to|from)JSON\(.*?\)\s*{[\s\S]+?^\1}/gm,
              '',
            );
          }
        }

        if (!webglModule) return code;

        if (!options.background) code = removeBackground(code);

        if (!options.clipping) code = removeClipping(code);

        if (!options.environment) code = removeEnvironment(code);

        if (!options.shadows) code = removeShadows(code);

        if (!options.textures) code = removeTextures(code);

        if (!options.xr) code = removeXR(code);

        const keepShaders: string[] = [];
        const unwantedIncludes: IncludeName[] = [];

        for (const include of includes) {
          if (options.includes.has(include)) {
            keepShaders.push(include);
          } else {
            unwantedIncludes.push(include);
          }
        }

        code = pruneShaders(
          code,
          options.materials,
          keepShaders,
          unwantedIncludes,
        );

        /** Minify *wanted* shader chunks */
        const shaders = code.matchAll(
          new RegExp(
            `(?:${keepShaders.join('|')}) = ("([\\s\\S]+?)");\\n`,
            'g',
          ),
        );

        for (const shader of shaders) {
          const shaderCode = shader[1];

          const rawShaderCode = shader[2]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');

          code = code.replace(shaderCode, `\`\n${minifyGLSL(rawShaderCode)}\``);
        }

        /** Minify inline shader code */
        const inlineShaders = code.matchAll(/\/\* glsl \*\/\s*`([\s\S]+?)`/g);

        for (const shader of inlineShaders) {
          const shaderCode = shader[1];

          code = code.replace(shaderCode, minifyGLSL(shaderCode));
        }

        return code;
      },
    },
  };
}

export type { IncludeName, FeatureName, MaterialName } from './const';
export type { UserOptions } from './options';
