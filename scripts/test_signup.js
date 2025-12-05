(async ()=>{
  try{
    const res = await fetch('http://localhost:5000/api/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ fullName: 'Test User', email: 'testuser@example.com', password: 'test123' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  }catch(e){
    console.error('Fetch error', e);
  }
})();
