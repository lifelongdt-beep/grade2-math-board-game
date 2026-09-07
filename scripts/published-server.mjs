import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = '0.0.0.0';
const port = Number(process.env.PORT ?? 5173);

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
const MAX_RECORDS = 5000;
const remoteState = {
  players: new Map(),
  records: [],
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
      if (raw.length > 200_000) request.destroy();
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
  if (pathname === '/api/join' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const id = nextRemotePlayerId;
    nextRemotePlayerId += 1;
    remoteState.players.set(id, {
      id,
      attendanceNo: Number(body.attendanceNo) || id,
      name: String(body.name ?? `${id}번 학생`),
      color: '#7c6bd6',
      difficulty: body.difficulty === '하' || body.difficulty === '상' ? body.difficulty : '중',
      avatar: typeof body.avatar === 'string' ? body.avatar : '🦊',
    });
    return sendJson(response, 200, { id });
  }

  if (pathname === '/api/record' && request.method === 'POST') {
    const record = await readJsonBody(request);
    if (typeof record.playerId !== 'number' || typeof record.id !== 'string') {
      return sendJson(response, 400, { ok: false });
    }
    remoteState.records.push(record);
    if (remoteState.records.length > MAX_RECORDS) {
      remoteState.records.splice(0, remoteState.records.length - MAX_RECORDS);
    }
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
    response.end(error instanceof Error ? error.message : 'Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Published game server running at http://localhost:${port}/`);
});
