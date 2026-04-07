/** Matches all multi-line GLSL comments */
const multiLineComments: RegExp = /\s*\/\*[\s\S]+?\*\//gm;

/** Matches all single-line GLSL comments */
const singleLineComments: RegExp = /\s*\/\/.*?$/gm;

/** Matches 2 or more consecutive whitespace characters (except newline) */
const consecutiveWhitespace: RegExp = /[ \t]{2,}/g;

/** Matches floats starting with 0 */
const floatStarting0: RegExp = /(\D)0(\.\d+)/g;

/** Matches floats ending with 0 */
const floatEnding0: RegExp = /(\d+\.)0(\D)/g;

/** Matches whitespace around symbols */
const redundantWhitespace: RegExp =
  /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|\?|:|;)\s*/g;

/** Matches `#if` and `#elif` directives (condition in capture group `[1]`) */
const ifDirective: RegExp = /^#(?:if|elif) ([ \S]+)$/;

/**
 * Compress the GLSL code
 * Adapted from `vite-plugin-glsl`
 * https://github.com/UstymUkhman/vite-plugin-glsl/blob/main/src/loadShader.js
 * @param glsl GLSL code
 * @returns Compressed GLSL code
 */
export default function (glsl: string): string {
  let newLine = false;

  return glsl
    .replace(multiLineComments, '')
    .replace(singleLineComments, '')
    .replace(floatStarting0, '$1$2') // (0.1 → .1)
    .replace(floatEnding0, '$1$2') // (1.0 → 1.)
    .replace(consecutiveWhitespace, ' ')
    .split(/\n+/)
    .reduce<string[]>((result, line) => {
      line = line.trim();

      if (line[0] === '#') {
        if (newLine) result.push('\n');
        const directive = ifDirective.exec(line);

        if (directive !== null) {
          line = line.replace(
            directive[1],
            directive[1].replace(redundantWhitespace, '$1'),
          );
        }
        result.push(line, '\n');
        newLine = false;
        return result;
      }

      if (
        !(line[0] === '{') &&
        result.length > 0 &&
        result[result.length - 1].endsWith('else')
      ) {
        result.push(' ');
      }

      result.push(line.replace(redundantWhitespace, '$1'));
      newLine = true;

      return result;
    }, [])
    .join('')
    .replace(/\n+/g, '\n');
}
