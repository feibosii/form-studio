import { cp, writeFile } from 'node:fs/promises';
await writeFile('docs/.nojekyll', '');
await cp('outputs', 'docs/outputs', { recursive: true });
