(async () => {
  const base = 'http://127.0.0.1:5001/api/auth';
  try {
    console.log('Signing up...');
    let res = await fetch(`${base}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test User', email: 'testuser+fetch@test.local', password: 'test1234' }),
    });
    const signupBody = await res.text();
    console.log('signup status', res.status);
    console.log('signup body:', signupBody);
    console.log('signup set-cookie:', res.headers.get('set-cookie'));

    console.log('\nLogging in...');
    res = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser+fetch@test.local', password: 'test1234' }),
    });
    const loginBody = await res.text();
    console.log('login status', res.status);
    console.log('login body:', loginBody);
    console.log('login set-cookie:', res.headers.get('set-cookie'));
  } catch (err) {
    console.error('error', err);
  }
})();
