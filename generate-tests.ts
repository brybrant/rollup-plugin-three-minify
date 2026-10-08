import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Glob, write } from 'bun';

const node_modules = resolve(process.cwd(), 'node_modules');
const output = resolve(process.cwd(), 'test/generated');

const milestonesGlob = new Glob('three-r?*');

const milestones = await Array.fromAsync(
  milestonesGlob.scan({
    cwd: node_modules,
    onlyFiles: false,
  }),
);

milestones.sort();

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const milestone of milestones) {
  const revision = milestone.slice('three-r'.length);

  await write(
    resolve(output, `r${revision}.test.ts`),
    [
      `import { defineMilestoneTests } from '../milestones.ts';`,
      `await defineMilestoneTests('${milestone}');\n`,
    ].join('\n'),
  );
}
