import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile, rename } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { networkInterfaces, homedir } from 'node:os';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = '0.0.0.0';
const port = Number(process.env.PORT ?? 5173);
const teacherToken = randomBytes(32).toString('hex');
const localAddresses = new Set(['127.0.0.1', '::1', ...Object.values(networkInterfaces()).flat().filter(Boolean).map(info => info.address)]);
const isTeacherComputer = (request) => !request.headers['x-forwarded-for'] && !request.headers['cf-connecting-ip'] && !request.headers.forwarded && localAddresses.has((request.socket.remoteAddress ?? '').replace(/^::ffff:/, ''));
const hasTeacherCookie = (request) => (request.headers.cookie ?? '').split(';').some(cookie => cookie.trim() === `mathTeacher=${teacherToken}`);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
]);

const resolvePath = async (requestUrl) => {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(root, normalizedPath === '/' ? 'index.html' : normalizedPath);
  if (!resolve(candidate).startsWith(resolve(root) + sep)) return join(root, 'index.html');

  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
  } catch {
    // Fall through to the SPA fallback.
  }

  return join(root, 'index.html');
};

// 큐알로 들어온 학생 폰과 선생님 화면은 서로 다른 기기라, 브라우저
// 메모리만으로는 답안이 선생님 쪽으로 건너가지 않습니다. 이 서버가
// 그 사이를 잇는 자리입니다 — 학생 폰이 자기 정보와 푼 기록을
// 여기 올려 두면, 선생님 화면이 주기적으로 읽어 갑니다.
//
// 프로세스가 켜져 있는 동안만 기억합니다(수업이 끝나 창을 닫으면
// 비워집니다) — 이 앱은 원래 아무것도 저장하지 않는 앱이었고, 여기서도
// 그 성격을 그대로 둡니다.
const remoteState = {
  players: new Map(),
  records: [],
};
const dataDir = process.env.MATH_RELAY_DATA_DIR ?? join(homedir(), '.math-board');
const dataFile = join(dataDir, `relay-${createHash('sha256').update(root).digest('hex').slice(0, 16)}.json`);
await mkdir(dataDir, { recursive: true });
try {
  const saved = JSON.parse(await readFile(dataFile, 'utf8'));
  if (Array.isArray(saved.players)) saved.players.forEach(p => remoteState.players.set(p.id, p));
  if (Array.isArray(saved.records)) remoteState.records = saved.records;
} catch (error) { if (error.code !== 'ENOENT') throw error; }
let saving = Promise.resolve();
const persistState = () => {
  const body = JSON.stringify({ players: [...remoteState.players.values()], records: remoteState.records });
  const next = saving.catch(() => {}).then(async () => { await writeFile(`${dataFile}.tmp`, body); await rename(`${dataFile}.tmp`, dataFile); });
  saving = next;
  return next;
};

const sendJson = (response, statusCode, payload) => {
  const body = Buffer.from(JSON.stringify(payload));
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(body);
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      // 학생 한 명의 답안 하나는 아주 작습니다. 이보다 커지면 무언가
      // 잘못된 요청이므로 더 읽지 않고 끊습니다.
      if (raw.length > 2_000_000) request.destroy();
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });

let nextRemotePlayerId = 1001;

const handleApi = async (request, response, pathname) => {
  if (pathname === '/api/ping') return sendJson(response, 200, { ok: true });
  if (pathname === '/api/session' && request.method === 'GET') {
    if (!isTeacherComputer(request)) return sendJson(response, 403, { ok: false });
    response.setHeader('Set-Cookie', `mathTeacher=${teacherToken}; HttpOnly; SameSite=Strict; Path=/api/`);
    return sendJson(response, 200, { ok: true });
  }
  if ((pathname === '/api/state' || pathname === '/api/reset') && (!isTeacherComputer(request) || !hasTeacherCookie(request))) return sendJson(response, 403, { ok: false });
  if (pathname === '/api/join' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const id = Number.isInteger(body.id) && body.id >= 100000 && body.id <= 2100000000 ? body.id : nextRemotePlayerId;
    nextRemotePlayerId += 1;
    remoteState.players.set(id, {
      id,
      attendanceNo: Number(body.attendanceNo) || id,
      name: String(body.name ?? `${id}번 학생`),
      color: '#7c6bd6',
      difficulty: body.difficulty === '하' || body.difficulty === '상' ? body.difficulty : '중',
      avatar: typeof body.avatar === 'string' ? body.avatar : '🦊',
    });
    await persistState();
    return sendJson(response, 200, { id });
  }

  if (pathname === '/api/record' && request.method === 'POST') {
    const record = await readJsonBody(request);
    if (typeof record.playerId !== 'number' || typeof record.id !== 'string') {
      return sendJson(response, 400, { ok: false });
    }
    const previous = remoteState.records.findIndex(one => one.id === record.id);
    if (previous >= 0) remoteState.records[previous] = record;
    else remoteState.records.push(record);
    await persistState();
    return sendJson(response, 200, { ok: true });
  }

  if (pathname === '/api/state' && request.method === 'GET') {
    return sendJson(response, 200, {
      players: [...remoteState.players.values()],
      records: remoteState.records,
    });
  }

  if (pathname === '/api/reset' && request.method === 'POST') {
    remoteState.players.clear();
    remoteState.records = [];
    await persistState();
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 404, { ok: false });
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url.pathname);
      return;
    }

    const filePath = await resolvePath(request.url ?? '/');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mimeTypes.get(extname(filePath)) ?? 'application/octet-stream',
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Published game server running at http://localhost:${port}/`);
});
