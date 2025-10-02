import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stationData = [];

function isRelevantStation(feature) {
  const route = feature.properties?.route_id;
  const url = feature.properties?.stop_url;
  return url && ['1', '2', '4', '5'].includes(route);
}

app.get('/api/check', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
