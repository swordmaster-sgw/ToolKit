try {
  const t = require('./tools-lib.js');
  console.log('Loaded tools:', Object.keys(t).length);
  console.log(Object.keys(t));
} catch(e) {
  console.log('Error:', e.message);
}
