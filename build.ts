import { resolve } from 'path';
import { removeSync, mkdirpSync, copySync } from 'fs-extra';
import { sync as spawnSync } from 'cross-spawn';
import 'colors';

const BUILD_DIR = resolve('./build');

const logStep = (step: string) => console.log(('> ' + step).blue);

const buildTSSubproject = (name: string) => {
  logStep(name + ': Building TypeScript subproject...');
  spawnSync(resolve('./node_modules/.bin/tsc'), [], {
    env: {
      ...process.env,
      INLINE_RUNTIME_CHUNK: 'false',
      GENERATE_SOURCEMAP: 'false',
    },
    cwd: resolve('./', name),
    stdio: 'inherit',
    shell: true,
  });
};

const copyBuildFiles = (name: string) => {
  logStep(name + ': Copying build files...');
  const targetDirectory = resolve(BUILD_DIR, name);

  mkdirpSync(targetDirectory);

  copySync(resolve('./', name, 'build'), targetDirectory, {
    overwrite: true,
    recursive: true,
  });
};

const subprojects = [{ name: 'contentscript', type: 'ts' }];

logStep('Removing build directory...');
try {
  removeSync(BUILD_DIR);
} catch {}

logStep('Creating a build directory...');
try {
  mkdirpSync(BUILD_DIR);
} catch {}

for (let subproject of subprojects) {
  switch (subproject.type) {
    case 'ts':
      buildTSSubproject(subproject.name);
      break;
    default:
      throw new Error('Unsupported subproject type: ' + subproject.type);
  }

  copyBuildFiles(subproject.name);
}

logStep('Copying public files...');
copySync(resolve('./public'), BUILD_DIR, {
  overwrite: true,
  recursive: true,
});
