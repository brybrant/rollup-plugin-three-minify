// @ts-expect-error No declaration
import { UniformsLib } from 'three';

import { type Replacer, revision } from './const';

import { glslFunctions, glslKeywords, glslTypes } from './glsl-grammar';

const threeFunctions = [
  ...(revision < 136
    ? [
        /** Old transcoding functions */
        'GammaToLinear',
        'LinearToGamma',
        'LinearToRGBD',
        'LinearToRGBE',
        'LinearToRGBM',
        'RGBDToLinear',
        'RGBEToLinear',
        'RGBMToLinear',
      ]
    : []),
  ...(revision < 137
    ? [
        /** Old decoding functions */
        'emissiveMapTexelToLinear',
        'envMapTexelToLinear',
        'lightMapTexelToLinear',
        'mapTexelToLinear',
        'matcapTexelToLinear',
        'sheenColorMapTexelToLinear',
        'specularColorMapTexelToLinear',
        'sRGBToLinear',
      ]
    : []),
  ...(revision < 157
    ? /** Old decoding functions */ ['LinearToLinear', 'LinearTosRGB']
    : /** New decoding functions */ ['LinearTransferOETF', 'sRGBTransferOETF']),
  ...(revision >= 157 && revision < 170
    ? ['LinearDisplayP3ToLinearSRGB', 'LinearSRGBToLinearDisplayP3']
    : []),
  ...(revision < 160 ? [] : ['AgXToneMapping']),
  ...(revision < 161 ? [] : ['NeutralToneMapping']),
  ...(revision < 167 ? [] : ['luminance']),
  ...(revision < 168 ? ['OptimizedCineonToneMapping'] : ['CineonToneMapping']),
  ...(revision < 170 ? [] : ['sRGBTransferEOTF']),
  'ACESFilmicToneMapping',
  'CustomToneMapping',
  'linearToOutputTexel',
  'LinearToneMapping',
  'ReinhardToneMapping',
  'toneMapping',
];

/** Contains all strings which may *never* be changed */
const reserved = new Set([
  ...glslFunctions,
  ...glslKeywords,
  ...glslTypes,
  ...threeFunctions,
]);

type UniformsLib = {
  [uniformGroup: string]: {
    [uniformName: string]: {
      value: unknown;
      properties?: {
        [property: string]: unknown;
      };
    };
  };
};

/**
 * Adds all Uniforms (and properties of `struct` type uniforms) to `reserved`
 */
for (const uniformGroup of Object.values(UniformsLib as UniformsLib)) {
  for (const [uniformName, uniformValue] of Object.entries(uniformGroup)) {
    reserved.add(uniformName);

    if (uniformValue.properties === undefined) continue;

    for (const property of Object.keys(uniformValue.properties)) {
      reserved.add(property);
    }
  }
}

const types = `(${[
  // Image / Sampler / Texture types
  '[iu]?(?:image|sampler|texture)[12]D(?:Array)?',
  '[iu]?(?:image|sampler|texture)2DMS(?:Array)?',
  '[iu]?(?:image|sampler|texture)2DRect',
  '[iu]?(?:image|sampler|texture)(?:3D|Buffer|Cube)',
  '[iu]?(?:image|sampler|texture)CubeArray',
  // Matrix types
  'd?mat[234](?:x[234])?',
  // Sampler types
  'sampler[12]D(?:Array)?Shadow',
  'sampler2D(?:Rect)?Shadow',
  'sampler3DRect',
  'sampler(?:Cube)?(?:Array)?Shadow',
  // Subpass types
  '[iu]?subpassInput(?:MS)?',
  // Vector types
  '[bdfhiu]?vec[234]',
  // Other types
  'bool',
  'double',
  'float',
  'struct',
  'u?int',
  'void',
]
  .sort((a, b) => b.length - a.length)
  .join('|')})`;

const immutable = '((?:attribute|uniform)\\s+(?:(?:high|medium|low)p\\s+)?)';

/** Matches declarations */
const declarationRegex = new RegExp(
  `${immutable}?${types}\\s+(\\w+)(?=\\s*[=()[;,])`,
  'g',
);

type IdentifierMetadata = {
  /** How many times the identifier occurs throughout the shader code */
  frequency: number;
  /** New identifier (following the pattern `_[a-zA-Z0-9]+`) */
  mangle: string;
};

/** Map of "mutable" identifiers */
const identifiers: Map<string, IdentifierMetadata> = new Map();

const componentRegex = /^([xyzw]{1,4}|[rgba]{1,4}|[stpq]{1,4})$/;

const identifierRecorder: Replacer = (match, immutable, type, identifier) => {
  if (immutable) {
    reserved.add(identifier);
    identifiers.delete(identifier);
    return match;
  }

  if (
    reserved.has(identifier) ||
    identifier.length < 3 ||
    (type === 'void' && identifier === 'main')
  ) {
    return match;
  }

  if (componentRegex.test(identifier)) return match;

  if (!identifiers.has(identifier)) {
    identifiers.set(identifier, { frequency: 0, mangle: '' });
  }

  return match;
};

let mutableIdentifierRegex: RegExp;

/**
 * Add each mutable identifier to `identifiers` record for later mangling
 * @param code code
 */
export function recordIdentifiers(code: string) {
  code.replace(declarationRegex, identifierRecorder);

  /** This should be impossible */
  if (identifiers.size < 1) {
    throw new Error('No mutable GLSL identifiers found!');
  }

  /** Create a regular expression to find mutable identifiers */
  mutableIdentifierRegex = new RegExp(
    `\\b(${[...identifiers.keys()]
      .sort((a, b) => b.length - a.length)
      .join('|')})\\b`,
    'g',
  );
}

const identifierCounter: Replacer = (match) => {
  const metadata = identifiers.get(match);

  if (metadata === undefined) return match;

  metadata.frequency++;

  return match;
};

/**
 * Searches `glsl` for all `identifiers` and counts the frequency of each one
 * @param glsl glsl
 * @returns `glsl` (unmodified)
 */
export function countIdentifiers(glsl: string) {
  glsl.replace(mutableIdentifierRegex, identifierCounter);

  return glsl;
}

/**
 * Sort identifiers by frequency, then create a new unique identifier for each
 * - The most frequent identifiers get the shortest new identifier
 * - The least frequent identifiers get the longest new identifier
 */
export function createIdentifiers() {
  const dictionary =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const baseDictionary = dictionary.length;

  let counter = 0;

  /** @returns Unique GLSL identifier */
  function getIdentifier(): string {
    let n = counter;
    let identifier = dictionary[n % baseDictionary];
    n = Math.floor(n / baseDictionary);

    while (n > 0) {
      identifier = dictionary[n % baseDictionary] + identifier;
      n = Math.floor(n / baseDictionary);
    }

    counter++;

    return identifier;
  }

  [...identifiers.entries()]
    .filter(([identifier, meta]) => {
      if (meta.frequency === 0) identifiers.delete(identifier);
      return meta.frequency > 0;
    })
    .sort(([, meta1], [, meta2]) => meta2.frequency - meta1.frequency)
    .forEach(([identifier, meta]) => {
      const newIdentifier = getIdentifier();

      /**
       * This check will probably always be redundant because `getIdentifier`
       * can produce 3906 unique identifiers up to 2 characters in length.
       * - The new identifier is always prefixed by an underscore.
       * - We only mangle identifiers which are at least 3 characters long.
       * - I have not yet observed `identifiers.size` being larger than ~700.
       */
      if (newIdentifier.length + 1 > identifier.length) {
        identifiers.delete(identifier);
        console.log(
          `Identifier "${newIdentifier}" longer than "${identifier}"`,
        );
        return counter--;
      }

      meta.mangle = newIdentifier;
    });
}

const mutableReplacer: Replacer = (match) => {
  const metadata = identifiers.get(match);

  if (metadata === undefined) return match;

  return `_${metadata.mangle}`;
};

/**
 * Mangles the mutable identifiers in `glsl`
 * @param glsl GLSL shader code
 * @returns `glsl` with mangled identifiers
 */
export function mangleIdentifiers(glsl: string) {
  return glsl.replace(mutableIdentifierRegex, mutableReplacer);
}
