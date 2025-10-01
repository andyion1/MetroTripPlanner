import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/check', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});