import { BlobsServer } from '@netlify/blobs/server';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const token = randomBytes(24).toString('hex');
const blobs = new BlobsServer({ directory: path.join(root, '.netlify/local-blobs'), token, debug: Boolean(process.env.DEBUG_BLOBS), onRequest: process.env.DEBUG_BLOBS ? ({type,url}) => console.log(type,url) : undefined });
const { port } = await blobs.start();
const child = spawn(process.execPath, [
  path.join(root, 'node_modules/next/dist/bin/next'),
  process.argv.includes('--production') ? 'start' : 'dev',
  '--hostname', '0.0.0.0', '--port', '5173',
], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, LOCAL_BLOBS_URL: `http://localhost:${port}`, LOCAL_BLOBS_TOKEN: token, NEXT_TELEMETRY_DISABLED: '1' },
});
child.on('exit', async code => { await blobs.stop(); process.exitCode = code ?? 0; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
