import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { pathToFileURL } from 'node:url';

import { name } from '../package.json';

import type { Plugin } from 'rollup';

import { createFilter } from '@rollup/pluginutils';

import type * as THREE from 'three';

import {
  computeMetadata,
  type ChunkName,
  type MaterialName,
  type Replacer,
} from './const';
import { parseOptions, type Options, type UserOptions } from './options';

import { recordIdentifiers, createMangler } from './mangler';
import { pruneSubsystems } from './prune-subsystems';
import { minifyGLSL } from './minify-glsl';

const VIRTUAL_THREE_CORE = `\0${name}:core` as const;
const VIRTUAL_THREE_MODULE = `\0${name}:module` as const;

/** Matches inline GLSL */
const inlineRegex = /\/\* glsl \*\/`([^]+?)`/g;

/**
 * Minify GLSL code in Three.js and remove redundant `WebGLRenderer` subsystems
 * @param userOptions See [options](./options.ts)
 * @returns Rollup plugin
 */
export default function (userOptions: UserOptions = {}): Plugin {
  const require = createRequire(resolve(cwd(), 'package.json'));

  const threePath = require.resolve('three');

  const threeCoreID = resolve(threePath, '../three.core.js');
  const threeModuleID = resolve(threePath, '../three.module.js');

  const glslFilter = createFilter(
    userOptions.include ?? '**/*.glsl',
    userOptions.exclude,
  );

  let options: Options;

  let mangle: ReturnType<typeof createMangler>;

  /**
   * Regex to remove all `#include <xyz>` GLSL directives for all entries
   * which have been removed from `ShaderChunk`.
   *
   * If `options.chunks` contains *all* chunks, then none need to be removed.
   */
  let discardIncludeRegex: RegExp | null;

  /** Cached `three.core.js` (transformed) */
  let threeCoreTransformed: string;
  /** Cached `three.module.js` (transformed) */
  let threeModuleTransformed: string;

  let viteWarned = false;

  return {
    name,
    // @ts-expect-error This is a vite-specific property
    enforce: 'pre',
    // @ts-expect-error This is a vite-specific hook
    config(_, { mode }) {
      // https://vite.dev/guide/api-plugin#vite-specific-hooks

      // Dependency pre-bundling only applies in development mode.
      if (mode !== 'development') return;

      if (!viteWarned) {
        console.warn(
          `[${name}] Disabling Vite dependency pre-bundling for "three"`,
        );
        viteWarned = true;
      }

      return {
        optimizeDeps: {
          exclude: ['three'],
        },
      };
    },
    async buildStart() {
      const three = (await import(
        pathToFileURL(threeModuleID).href
      )) as typeof THREE;

      const revision = Number(three.REVISION);

      const metadata = computeMetadata(revision);

      const { chunks, materials } = metadata;

      options = parseOptions(userOptions, metadata);

      let threeCore = '';

      let threeModule = await readFile(threeModuleID, 'utf8');

      /**
       * The `code` parameter might be the contents of:
       * - `three.core.js` if the revision is 170 or below
       * - `three.module.js` if the revision is 171 or above
       * @param code code
       * @param options Options
       * @returns code (modified)
       */
      function preprocessCore(code: string, options: Options) {
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

        return code;
      }

      if (existsSync(threeCoreID)) {
        threeCore = await readFile(threeCoreID, 'utf8');

        threeCore = preprocessCore(threeCore, options);
      } else {
        threeModule = preprocessCore(threeModule, options);
      }

      threeModule = pruneSubsystems(threeModule, metadata, options);

      const unescapeGLSL = (glsl: string) => {
        return glsl.replace(/\\n/g, '\n').replace(/\\t/g, ' ');
      };

      /**
       * Three.js shader chunks to discard from the bundle
       * (Opposite of `Options['chunks']`)
       */
      const discardChunks: ChunkName[] = [];

      const UserChunk: Record<string, string> = {};

      const allChunks = Object.keys(chunks) as ChunkName[];

      for (const chunk of allChunks) {
        if (options.chunks.has(chunk)) {
          UserChunk[chunk] = unescapeGLSL(three.ShaderChunk[chunk]);
          continue;
        }
        discardChunks.push(chunk);
      }

      /**
       * All `ShaderChunk` variables must be removed to get an accurate
       * analysis of GLSL identifiers later for mangling
       */
      const glslVariableRegex = new RegExp(
        `(const|var) (${allChunks.join('|')}|(vertex|fragment)\\$[a-z0-9]).+\\n+`,
        'g',
      );

      threeModule = threeModule.replace(glslVariableRegex, '');

      discardIncludeRegex =
        discardChunks.length > 0
          ? new RegExp(`\\s*#include <(${discardChunks.join('|')})>`, 'g')
          : null;

      const materialGroup = `(${Object.keys(materials).join('|')})`;

      const materialKey = 'ShaderChunk\\.([a-zA-Z]+)';

      /** Matches entries in `ShaderLib` */
      const materialRegex = new RegExp(
        `^([\\t ]+)${materialGroup}:\\s*{[^]+?${materialKey}[^]+?^\\1},?\\n+`,
        'gm',
      );

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

          UserChunk[vertShader] = unescapeGLSL(three.ShaderChunk[vertShader]);
          UserChunk[fragShader] = unescapeGLSL(three.ShaderChunk[fragShader]);

          return match;
        }

        return '';
      };

      threeModule = threeModule.replace(
        /ShaderLib\s*=\s*{[^]+?};\s*ShaderLib\.physical\s*=\s*{[^]+?};/,
        (ShaderLib) => {
          ShaderLib = ShaderLib.replace(materialRegex, materialReplacer);

          if (options.materials.has('physical')) return ShaderLib;

          /**
           * `physical` is always the final `ShaderLib` entry; assigned after
           * instatiation because it uses `ShaderLib.standard` uniforms
           */
          return ShaderLib.replace(/ShaderLib\.physical[^]+/, '');
        },
      );

      if (options.mangle) {
        const { identifiers, identifierRegex } = recordIdentifiers(
          threeCore + threeModule,
          three.UniformsLib,
          revision,
        );

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

        threeCore.replace(inlineRegex, inlineIdentifierCounter);
        threeModule.replace(inlineRegex, inlineIdentifierCounter);

        mangle = createMangler(identifiers);
      }

      const newShaderChunk: string[] = ['ShaderChunk = {'];

      for (const chunk in UserChunk) {
        let glsl = minifyGLSL(UserChunk[chunk]);

        if (options.mangle) glsl = mangle(glsl);

        if (discardIncludeRegex) glsl = glsl.replace(discardIncludeRegex, '');

        newShaderChunk.push(`\t${chunk}: \`${glsl}\`,`);
      }

      newShaderChunk.push('};');

      threeModule = threeModule.replace(
        /ShaderChunk\s*=[^]+?};/,
        newShaderChunk.join('\n'),
      );

      /**
       * Minify inline GLSL
       * @param _ `$&`
       * @param glsl GLSL (`$1`)
       * @returns GLSL (minified)
       */
      const inlineMinifier: Replacer = (_, glsl) => {
        glsl = minifyGLSL(glsl);

        if (options.mangle) glsl = mangle(glsl);

        if (discardIncludeRegex) glsl = glsl.replace(discardIncludeRegex, '');

        return `/* glsl */\`${glsl}\``;
      };

      threeCore = threeCore.replace(inlineRegex, inlineMinifier);
      threeModule = threeModule.replace(inlineRegex, inlineMinifier);

      threeCoreTransformed = threeCore;
      threeModuleTransformed = threeModule;
    },
    resolveId: {
      order: 'pre',
      handler(source, importer) {
        switch (source) {
          case 'three':
            return VIRTUAL_THREE_MODULE;

          case './three.core.js':
            if (importer === VIRTUAL_THREE_MODULE) return VIRTUAL_THREE_CORE;
        }

        return null;
      },
    },
    load: {
      order: 'pre',
      handler(id) {
        switch (id) {
          case VIRTUAL_THREE_CORE:
            return threeCoreTransformed;

          case VIRTUAL_THREE_MODULE:
            return threeModuleTransformed;
        }

        return null;
      },
    },
    transform(code, id) {
      if (!glslFilter(id)) return null;

      code = minifyGLSL(code);

      if (options.mangle) code = mangle(code);

      if (discardIncludeRegex) code = code.replace(discardIncludeRegex, '');

      return `export default \`${code}\``;
    },
  };
}

export type { ChunkName, FeatureName, MaterialName } from './const';
export type { UserOptions } from './options';
