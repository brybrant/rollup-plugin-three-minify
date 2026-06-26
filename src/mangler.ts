import { type Replacer } from './const';

import { glslFunctions, glslKeywords, glslTypes } from './glsl-grammar';

const threeFunctions = (revision: number) => [
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

/** Map which records the frequency of mutable identifiers in the GLSL */
type IdentifierMap = Map<string, number>;

const componentRegex = /^([xyzw]{1,4}|[rgba]{1,4}|[stpq]{1,4})$/;

/**
 * Create an identifier frequency map, and a regular expression to find them
 * @param code code
 * @param uniforms `THREE.UniformsLib`
 * @param revision `THREE.REVISION`
 * @returns `{ identifiers, identifierRegex }`
 */
export function recordIdentifiers(
  code: string,
  uniforms: typeof import('three').UniformsLib,
  revision: number,
) {
  /** Map of "mutable" identifiers */
  const identifiers: IdentifierMap = new Map();

  /** Contains all strings which may *never* be changed */
  const reservedIdentifiers = new Set([
    ...glslFunctions,
    ...glslKeywords,
    ...glslTypes,
    ...threeFunctions(revision),
  ]);

  /**
   * Adds all Uniforms + keys of `struct` uniforms to `reservedIdentifiers`
   */
  for (const uniformGroup of Object.values(uniforms)) {
    for (const [uniformName, uniformValue] of Object.entries(uniformGroup)) {
      reservedIdentifiers.add(uniformName);

      if (uniformValue.properties === undefined) continue;

      for (const property of Object.keys(uniformValue.properties)) {
        reservedIdentifiers.add(property);
      }
    }
  }

  const identifierRecorder: Replacer = (match, immutable, type, identifier) => {
    if (immutable) {
      reservedIdentifiers.add(identifier);
      identifiers.delete(identifier);
      return match;
    }

    if (
      reservedIdentifiers.has(identifier) ||
      identifier.length < 3 ||
      (type === 'void' && identifier === 'main')
    ) {
      return match;
    }

    if (componentRegex.test(identifier)) return match;

    if (!identifiers.has(identifier)) identifiers.set(identifier, 0);

    return match;
  };

  code.replace(declarationRegex, identifierRecorder);

  /** This should be impossible */
  if (identifiers.size < 1) {
    throw new Error('Internal error: No mutable GLSL identifiers found!');
  }

  /** Regex to find *all* mutable identifiers */
  const identifierRegex = new RegExp(
    `\\b(${[...identifiers.keys()]
      .sort((a, b) => b.length - a.length)
      .join('|')})\\b`,
    'g',
  );

  return {
    identifiers,
    identifierRegex,
  };
}

const dictionary =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const baseDictionary = dictionary.length;

/**
 * Sort identifiers by frequency, then create a new unique identifier for each
 * - The most frequent identifiers get the shortest new identifier
 * - The least frequent identifiers get the longest new identifier
 *
 * Builds an immutable map correlating old identifiers to new identifiers.
 *
 * Returns a "mangler" function which replaces all identifiers.
 * @param identifiers Map of mutable identifiers
 * @returns mangler
 */
export function createMangler(identifiers: IdentifierMap) {
  let counter = 0;

  /** @returns Unique GLSL identifier */
  function getIdentifier(): string {
    let n = counter++;
    let identifier = '';

    do {
      identifier = dictionary[n % baseDictionary] + identifier;
      n = Math.floor(n / baseDictionary) - 1;
    } while (n >= 0);

    return identifier;
  }

  const mangleMap: Readonly<{ [identifier: string]: string }> = Object.freeze(
    Object.fromEntries(
      [...identifiers.entries()]
        .filter(([, frequency]) => frequency > 0)
        .sort(([, frequency1], [, frequency2]) => frequency2 - frequency1)
        .flatMap(([identifier]) => {
          const newIdentifier = getIdentifier();

          /**
           * This check is probably forever redundant because `getIdentifier`
           * can produce 3906 unique identifiers up to 2 characters in length.
           * - The new identifier is always prefixed by an underscore.
           * - We only mangle identifiers which are at least 3 characters long.
           * - I have not yet seen `identifiers.size` become larger than 600.
           */
          if (newIdentifier.length + 1 > identifier.length) {
            console.log(
              `Identifier "${newIdentifier}" longer than "${identifier}"`,
            );
            counter--;
            return [];
          }

          return [[identifier, newIdentifier]];
        }),
    ),
  );

  /** Regex to find *relevant* mutable identifiers */
  const identifierRegex = new RegExp(
    `\\b(${Object.keys(mangleMap)
      .sort((a, b) => b.length - a.length)
      .join('|')})\\b`,
    'g',
  );

  const mutableReplacer: Replacer = (match) => `_${mangleMap[match]}`;

  return (glsl: string) => glsl.replace(identifierRegex, mutableReplacer);
}
