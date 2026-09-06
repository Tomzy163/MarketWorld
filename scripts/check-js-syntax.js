import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const roots = process.argv.slice(2);

if (roots.length === 0) {
  process.stderr.write('Usage: node scripts/check-js-syntax.js <path> [...path]\n');
  process.exit(1);
}

const files = roots.flatMap((root) => collectJsFiles(resolve(root)));
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push(`${file}\n${result.stderr}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(failures.join('\n'));
  process.exit(1);
}

process.stdout.write(`JavaScript syntax check passed for ${files.length} files.\n`);

function collectJsFiles(path) {
  const stat = statSync(path);
  if (stat.isFile()) {
    return path.endsWith('.js') ? [path] : [];
  }

  return readdirSync(path)
    .filter((entry) => !['node_modules', 'dist', 'coverage'].includes(entry))
    .flatMap((entry) => collectJsFiles(resolve(path, entry)));
}
