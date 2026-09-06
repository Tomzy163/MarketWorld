import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const required = [
  'package.json',
  'pnpm-workspace.yaml',
  '.env.example',
  'docker-compose.yml',
  'backend/package.json',
  'backend/src/app.js',
  'backend/src/server.js',
  'backend/src/docs/openapi.yaml',
  'apps/web/package.json',
  'apps/web/src/app/main.js',
  'apps/web/src/router/index.js',
  'packages/shared/package.json',
  'database/migrations/001_extensions.sql',
  'database/migrations/002_users.sql',
  'database/migrations/003_sellers.sql',
  'database/migrations/004_customers.sql',
  'database/migrations/005_roles_permissions.sql',
  'database/migrations/043_rls_policies.sql',
  'database/migrations/044_indexes.sql',
];

const missing = required.filter((file) => !existsSync(resolve(file)));

if (missing.length > 0) {
  console.error(`Missing required foundation files:\n${missing.map((file) => `- ${file}`).join('\n')}`);
  process.exit(1);
}

process.stdout.write('MarketWorld foundation file verification passed.\n');
