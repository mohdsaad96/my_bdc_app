// Simple end-to-end test script for group create + socket events
const { io } = require('socket.io-client');

const BASE = 'http://localhost:5000';
const API = BASE + '/api';
const fetch = global.fetch || require('node-fetch');

function extractCookie(setCookie) {
  if (!setCookie) return '';
  // setCookie may be an array or string
  if (Array.isArray(setCookie)) setCookie = setCookie[0];
  return setCookie.split(';')[0];
}

async function signup(name, email) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: name, email, password: 'Password123' }),
  });
  const body = await res.json();
  const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');
  return { body, cookie: extractCookie(setCookie) };
}

async function createGroup(cookie, name, members) {
  const res = await fetch(`${API}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ name, members }),
  });
  return await res.json();
}

async function main() {
  console.log('Starting E2E group test...');
  const unique = Date.now().toString().slice(-6);
  const userAEmail = `e2eA+${unique}@example.com`;
  const userBEmail = `e2eB+${unique}@example.com`;

  const a = await signup('E2E A', userAEmail);
  console.log('Signed up A:', a.body._id);
  const b = await signup('E2E B', userBEmail);
  console.log('Signed up B:', b.body._id);

  const sockA = io(BASE, { query: { userId: a.body._id }, reconnectionDelayMax: 1000 });
  const sockB = io(BASE, { query: { userId: b.body._id }, reconnectionDelayMax: 1000 });

  sockA.on('connect', () => console.log('Socket A connected'));
  sockB.on('connect', () => console.log('Socket B connected'));

  sockA.on('groupCreated', (g) => console.log('Socket A groupCreated', g._id));
  sockB.on('groupCreated', (g) => console.log('Socket B groupCreated', g._id));

  sockA.on('groupUpdated', (g) => console.log('Socket A groupUpdated', g._id));
  sockB.on('groupUpdated', (g) => console.log('Socket B groupUpdated', g._id));

  // wait for sockets to connect
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Creating group as A...');
  const group = await createGroup(a.cookie, `E2E Group ${unique}`, [b.body._id]);
  console.log('Create group response id:', group._id || JSON.stringify(group).slice(0, 200));

  // wait a bit to receive socket events
  await new Promise((r) => setTimeout(r, 2000));

  sockA.close();
  sockB.close();
  console.log('E2E test finished');
}

main().catch((e) => { console.error('E2E test failed', e); process.exit(1); });
