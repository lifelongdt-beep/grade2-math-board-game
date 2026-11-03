import { expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, rm, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { answerFixture } from './reliabilityFixtures';

for (const kind of (process.platform === 'win32' ? ['node', 'powershell'] : ['node'])) {
  it(`${kind}: 조회 권한·중복 제거·긴 한글 답안·서버 재시작 보존`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'math-board-test-'));
    const publicRoot = join(directory, 'public');
    await mkdir(publicRoot);
    await Promise.all(['published-server.mjs', 'published-server.ps1'].map(name => copyFile(join('scripts', name), join(publicRoot, name))));
    await writeFile(join(publicRoot, 'index.html'), '<!doctype html><title>fixture</title>');
    await writeFile(join(publicRoot, 'internet-run.log'), 'PRIVATE TEACHER LOG');
    const reservation = createServer();
    await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
    const address = reservation.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    await new Promise<void>(resolve => reservation.close(() => resolve()));
    const base = `http://127.0.0.1:${port}`;
    let child: ChildProcess | undefined;
    let serverOutput = '';
    const stop = async () => { if (!child || child.exitCode !== null) return; const processToStop = child; const closed = new Promise<void>(resolve => processToStop.once('exit', () => resolve())); processToStop.kill(); await closed; };
    const start = async () => {
      child = spawn(kind === 'node' ? process.execPath : 'powershell.exe', kind === 'node' ? [join(publicRoot, 'published-server.mjs')] : ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(publicRoot, 'published-server.ps1'), '-Port', String(port)], { windowsHide: true, env: { ...process.env, PORT: String(port), MATH_RELAY_DATA_DIR: join(directory, 'data'), MATH_TEACHER_SECRET: 'a'.repeat(64) }, stdio: ['ignore', 'pipe', 'pipe'] });
      await new Promise<void>((resolve, reject) => {
        let errors = '';
        child!.stderr!.on('data', data => { errors += String(data); });
        const timer = setTimeout(() => reject(new Error('서버 시작 시간 초과')), 15000);
        child!.stdout!.on('data', data => { serverOutput += String(data); if (String(data).includes('server running')) { clearTimeout(timer); resolve(); } });
        child!.once('error', error => { clearTimeout(timer); reject(error); });
        child!.once('exit', code => { clearTimeout(timer); reject(new Error(`서버 종료: ${code} ${errors}`)); });
      });
    };
    try {
      await start();
      expect((await fetch(`${base}/api/state`)).status).toBe(403);
      expect((await fetch(`${base}/api/session`, { headers: { 'X-Forwarded-For': '192.0.2.1', 'X-Math-Teacher': 'a'.repeat(64) } })).status).toBe(403);
      expect((await fetch(`${base}/api/session`)).status).toBe(403);
      expect((await fetch(`${base}/api/session`, { headers: { 'X-Math-Teacher': 'b'.repeat(64) } })).status).toBe(403);
      expect((await fetch(`${base}/published-server.ps1`)).status).toBe(404);
      expect((await fetch(`${base}/internet-run.log`)).status).toBe(404);
      expect((await fetch(base)).ok).toBe(true);
      let cookie = (await fetch(`${base}/api/session`, { headers: { 'x-math-teacher': 'a'.repeat(64) } })).headers.get('set-cookie')!.split(';')[0];
      const post = (path: string, body: unknown) => fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      await post('/api/join', { id: 123456, name: '1번', attendanceNo: 1, difficulty: '하' });
      const record = answerFixture({ playerId: 123456, explanation: '한글 설명'.repeat(7000) });
      expect((await post('/api/record', record)).ok, serverOutput).toBe(true);
      expect((await post('/api/record', record)).ok).toBe(true);
      let state = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookie } })).json();
      expect(state.records).toHaveLength(1); expect(state.records[0].explanation).toBe(record.explanation);
      await stop(); await start();
      cookie = (await fetch(`${base}/api/session`, { headers: { 'X-Math-Teacher': 'a'.repeat(64) } })).headers.get('set-cookie')!.split(';')[0];
      state = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookie } })).json();
      expect(state.records).toHaveLength(1); expect(state.players[0].id).toBe(123456);
      expect((await fetch(`${base}/api/reset`, { method: 'POST' })).status).toBe(403);
      expect((await fetch(`${base}/api/reset`, { method: 'POST', headers: { Cookie: cookie }, body: '{}' })).ok).toBe(true);
    } finally {
      await stop();
      if (!resolve(directory).startsWith(resolve(tmpdir()) + sep + 'math-board-test-')) throw new Error('잘못된 임시 경로');
      await rm(directory, { recursive: true, force: true });
    }
  }, 45000);
}

