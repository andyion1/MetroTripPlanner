import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/check', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});