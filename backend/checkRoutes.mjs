import('./src/routes/index.js').then((mod)=>{
  console.log('module keys:', Object.keys(mod));
  console.log('has default?', 'default' in mod);
}).catch((err)=>{
  console.error('import error:', err);
});