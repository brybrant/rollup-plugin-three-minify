import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { name } from '../package.json';

import type { Plugin } from 'rollup';

import { createFilter } from '@rollup/pluginutils';

import { ShaderChunk } from 'three';

import {
  chunks,
  materials,
  type ChunkName,
  type MaterialName,
  type Replacer,
  revision,
} from './const';
import { parseOptions, type UserOptions } from './options';

import { recordIdentifiers, createMangler } from './mangler';
import { pruneSubsystems } from './prune-subsystems';
import { minifyGLSL } from './minify-glsl';

const slash = (path: string) => path.replace(/\\/g, '/');

/** Matches inline GLSL */
const inlineShaderRegex = /\/\* glsl \*\/`([^]+?)`/g;

const shaderLibRegex = /ShaderLib\s*=[^]+ShaderLib\.physical\s*=[^]+?};/;

const shaderChunkRegex = /ShaderChunk\s*=[^]+?};/;

const unescapeGLSL = (glsl: string) => {
  return glsl.replace(/\\n/g, '\n').replace(/\\t/g, ' ');
};

/**
 * Minify GLSL code in Three.js and remove redundant `WebGLRenderer` subsystems
 * @param userOptions See [options](./options.ts)
 * @returns Rollup plugin
 */
export default function (userOptions: UserOptions = {}): Plugin {
  const options = parseOptions(userOptions);

  const require = createRequire(import.meta.url);

  const threePath = require.resolve('three');

  const threeModule = slash(resolve(threePath, '../three.module.js'));

  const threeBuildFiles = new Set([
    slash(resolve(threePath, '../three.cjs')),
    slash(resolve(threePath, '../three.core.js')),
    threeModule,
  ]);

  /** Cached Three.js builds (transformed) */
  const threeTransformed: Map<string, string> = new Map();

  const glslFilter = createFilter(
    userOptions.include ?? '**/*.glsl',
    userOptions.exclude,
  );

  const preprocess = (async () => {
    const threeCode = await readFile(threeModule, 'utf8');

    const { identifiers, identifierRegex } = recordIdentifiers(threeCode);

    /**
     * Three.js shader chunks to discard from the bundle
     * (Opposite of `Options['chunks']`)
     */
    const discardChunks: ChunkName[] = [];

    const UserChunk: Record<string, string> = {};

    const allChunks = Object.keys(chunks) as ChunkName[];

    for (const chunk of allChunks) {
      if (options.chunks.has(chunk)) {
        UserChunk[chunk] = unescapeGLSL(ShaderChunk[chunk]);
        continue;
      }
      discardChunks.push(chunk);
    }

    const discardIncludeRegex =
      discardChunks.length > 0
        ? new RegExp(`\\s*#include <(${discardChunks.join('|')})>`, 'g')
        : null;

    const materialGroup = `(${Object.keys(materials).join('|')})`;

    /** Matches entries in `ShaderLib` */
    const materialRegex = new RegExp(
      `^(\\s+)${materialGroup}:\\s*{[^]+?ShaderChunk\\.([a-zA-Z]+)[^]+?^\\1},?`,
      'gm',
    );

    let newShaderLib: string = '';

    /**
     * Removes redundant materials from `ShaderLib`
     * @param match `$&`
     * @param indent Used only for backreference within the regex (`$1`)
     * @param material Material (key of `ShaderLib`) (`$2`)
     * @param key Material (key of `ShaderChunk`) (`$3`)
     * @returns `match` or empty string
     */
    const materialReplacer: Replacer = (match, indent, material, key) => {
      if (options.materials.has(material as MaterialName)) {
        const vertShader = `${key}_vert`;
        const fragShader = `${key}_frag`;

        UserChunk[vertShader] = unescapeGLSL(ShaderChunk[vertShader]);
        UserChunk[fragShader] = unescapeGLSL(ShaderChunk[fragShader]);

        return match;
      }

      return '';
    };

    threeCode.replace(shaderLibRegex, (ShaderLib) => {
      ShaderLib = ShaderLib.replace(materialRegex, materialReplacer);

      if (options.materials.has('physical')) return (newShaderLib = ShaderLib);

      /**
       * `physical` is always the final `ShaderLib` entry and is assigned after
       * instatiation because it copies uniforms from `ShaderLib.standard`
       */
      return (newShaderLib = ShaderLib.replace(/ShaderLib\.physical[^]+/, ''));
    });

    const identifierCounter: Replacer = (match) => {
      const frequency = identifiers.get(match);

      /** Always true (but TypeScript is fussy) */
      if (frequency !== undefined) identifiers.set(match, frequency + 1);

      return match;
    };

    for (const chunk in UserChunk) {
      UserChunk[chunk].replace(identifierRegex, identifierCounter);
    }

    const inlineIdentifierCounter: Replacer = (_, glsl) => {
      return glsl.replace(identifierRegex, identifierCounter);
    };

    threeCode.replace(inlineShaderRegex, inlineIdentifierCounter);

    const mangle = createMangler(identifiers);

    const newShaderChunk: string[] = ['ShaderChunk = {'];

    for (const chunk in UserChunk) {
      let glsl = minifyGLSL(UserChunk[chunk]);

      if (options.mangle) glsl = mangle(glsl);

      if (discardIncludeRegex) glsl = glsl.replace(discardIncludeRegex, '');

      newShaderChunk.push(`\t${chunk}: \`${glsl}\`,`);
    }

    newShaderChunk.push('};');

    return {
      mangle,
      newShaderLib,
      newShaderChunk: newShaderChunk.join('\n'),
      discardIncludeRegex,
    };
  })();

  return {
    name,
    transform: {
      order: 'pre',
      async handler(code, id) {
        const { mangle, newShaderLib, newShaderChunk, discardIncludeRegex } =
          await preprocess;

        if (glslFilter(id)) {
          code = minifyGLSL(code);

          if (options.mangle) code = mangle(code);

          if (discardIncludeRegex) code = code.replace(discardIncludeRegex, '');

          return `export default \`${code}\`;`;
        }

        const normalizedId = slash(id);

        if (!threeBuildFiles.has(normalizedId)) return null;

        if (threeTransformed.has(normalizedId)) {
          return {
            code: threeTransformed.get(normalizedId),
            map: null,
          };
        }

        /**
         * Minify inline GLSL
         * @param _ `$&`
         * @param glsl GLSL (`$1`)
         * @returns GLSL (minified)
         */
        const shaderMinifier: Replacer = (_, glsl) => {
          glsl = minifyGLSL(glsl);

          if (options.mangle) glsl = mangle(glsl);

          if (discardIncludeRegex) glsl = glsl.replace(discardIncludeRegex, '');

          return `/* glsl */\`${glsl}\``;
        };

        code = code.replace(inlineShaderRegex, shaderMinifier);

        const threeCore = normalizedId.endsWith('three.core.js');

        if (revision < 171 || (revision >= 171 && threeCore)) {
          if (!options.jsonMethods) {
            /** Remove `toJSON` and `fromJSON` methods on all classes */
            code = code.replace(
              /^(\s+)(static )?(to|from)JSON\(.*\) {[\s\S]+?^\1}/gm,
              '',
            );
          }

          if (!options.colorKeywords) {
            /** Remove color keywords like "red", "green", and "blue" */
            code = code.replace(
              /colorKeywords = {[\s\S]+?};/,
              'colorKeywords = {};',
            );
          }
        }

        if (threeCore) {
          threeTransformed.set(normalizedId, code);
          return { code, map: null };
        }

        code = pruneSubsystems(code, options);

        code = code.replace(shaderLibRegex, newShaderLib);

        code = code.replace(shaderChunkRegex, newShaderChunk);

        threeTransformed.set(normalizedId, code);
        return { code, map: null };
      },
    },
  };
}

export type { ChunkName, FeatureName, MaterialName } from './const';
export type { UserOptions } from './options';
