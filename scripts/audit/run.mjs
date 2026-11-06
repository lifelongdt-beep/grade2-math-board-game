import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const require=createRequire(import.meta.url);
const vitest=dirname(require.resolve('vitest/package.json'));
const viteNode=dirname(require.resolve('vite-node/package.json',{paths:[vitest]}));
const result=spawnSync(process.execPath,[join(viteNode,'vite-node.mjs'),'scripts/audit/scan.ts',...process.argv.slice(2)],{stdio:'inherit'});
if(result.error) throw result.error;
process.exit(result.status??1);
