import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve('.');
const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !file.includes('node_modules/'));

const patterns = [
  { name: 'unfinished marker', regex: /\b(TODO|FIXME)\b/i },
  { name: 'unsafe socket room join', regex: /socket\.join\s*\(\s*(room|data\.room|payload\.room)/ },
  { name: 'client trusted payment marker', regex: /client[-_\s]?provided payment status/i },
];

const findings = [];

for (const file of trackedFiles) {
  if (/\.(png|jpg|jpeg|gif|ico|lock)$/i.test(file)) {
    continue;
  }

  const text = readFileSync(resolve(root, file), 'utf8');
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      findings.push(`${file}: ${pattern.name}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`Static audit found issues:\n${findings.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

process.stdout.write('Static audit checks passed.\n');
