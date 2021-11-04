import { series } from 'gulp';
import { clean, generateIcons, generateEntry, copy } from './util/tasks/';
import { generalConfig } from './util/plugins/svgo/presets';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getIdentifier } from './util';
import { assignAttrsAtTag } from './util/plugins/svg2Definition/transforms';

const iconTemplate = readFileSync(
  resolve(__dirname, './util/templates/icon.ts.ejs'),
  'utf8',
);

export default series(
  clean(['src/icons']),
  generateIcons({
    from: ['src/svg/*.svg'],
    toDir: 'src/icons',
    tmpDir: 'src/tmp',
    svgoConfig: generalConfig,
    template: iconTemplate,
    extraNodeTransformFactories: [
      assignAttrsAtTag('svg', { fill: 'currentColor' }),
    ],
    mapToInterpolate: ({ name, content }) => ({
      identifier: getIdentifier({ name }),
      content,
    }),
    filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Icon' }),
  }),
  generateEntry({
    entryName: 'index.ts',
    from: ['src/icons/*.tsx'],
    toDir: 'src/icons',
    banner: '// This index.ts file is generated automatically.\n',
    template: `export { default as <%= identifier %> } from '<%= path %>';`,
    mapToInterpolate: ({ name: identifier }) => ({
      identifier,
      path: `./${identifier}`,
    }),
  }),
  clean(['src/svg']),
  copy({from: ['src/tmp/*'], toDir: 'src/svg'}),
  clean(['src/tmp']),
);
