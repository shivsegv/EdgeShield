const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/hello', (req, res) => {
  console.log('Demo app received request:', req.method, req.path, req.headers['x-api-key']);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
});
