const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const BASE = 'http://10.144.235.46:5001/api';

async function run() {
  try {
    const signupPayload = { fullName: 'Test User', email: `testuser${Date.now()}@example.com`, password: 'test1234' };
    console.log('Signing up with', signupPayload.email);
    let res = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload),
    });
    console.log('Signup status', res.status);
    const signupBody = await res.text();
    console.log('Signup body:', signupBody);
    const setCookie = res.headers.get('set-cookie');
    console.log('Signup set-cookie header:', setCookie);

    // Login
    const loginPayload = { email: signupPayload.email, password: signupPayload.password };
    console.log('Logging in with', loginPayload.email);
    res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    });
    console.log('Login status', res.status);
    const loginBody = await res.text();
    console.log('Login body:', loginBody);
    const loginSetCookie = res.headers.get('set-cookie');
    console.log('Login set-cookie header:', loginSetCookie);
  } catch (err) {
    console.error('Error running tests', err);
  }
}

run();
const fetch = require('node-fetch');
const tough = require('tough-cookie');
const fetchCookie = require('fetch-cookie/node-fetch')(fetch, new tough.CookieJar());

(async () => {
  const base = 'http://10.144.235.46:5001/api/auth';
  try {
    console.log('Signing up...');
    const timestamp = Date.now();
    const testEmail = `testuser+node${timestamp}@test.local`;
    const signupRes = await fetchCookie(`${base}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test User', email: testEmail, password: 'test1234' }),
    });
    const signupJson = await signupRes.json();
    console.log('signup status', signupRes.status, signupJson);

    console.log('Logging in...');
    const loginRes = await fetchCookie(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test1234' }),
    });
    const loginJson = await loginRes.json();
    console.log('login status', loginRes.status, loginJson);

    // show cookies
    const cookies = await fetchCookie.cookieJar.getCookies('http://127.0.0.1:5001');
    console.log('cookies:', cookies.map(c => ({ key: c.key, value: c.value, domain: c.domain, path: c.path })));
  } catch (err) {
    console.error('error', err);
  }
})();
