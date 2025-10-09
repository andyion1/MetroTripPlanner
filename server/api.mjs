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

async function loadStationData() {
  const filePath = path.join(__dirname, 'data', 'stm_arrets_sig.geojson');
  const data = await fs.readFile(filePath, 'utf-8');
  const jsonData = JSON.parse(data);
  stationData = jsonData.features.filter(isRelevantStation);
}

loadStationData().then(() => {
  app.get('/api/stations', (req, res) => {
    res.json(stationData);
  });


  app.get('/api/line/:lineId', (req, res) => {
    const { lineId } = req.params;

    if (!['1', '2', '4', '5'].includes(lineId)) {
      return res.status(400).json({ error: 'Invalid metro line id' });
    }

    const stations = stationData.filter(f => f.properties.route_id === lineId);
    res.json(stations);
  });


  app.get('/api/between', (req, res) => {
    const { lineId, start, end } = req.query;
    if (!lineId || !start || !end) {
      return res.status(400).json({ error: 'Missing lineId, start, or end' });
    }
    if (!['1', '2', '4', '5'].includes(lineId)) {
      return res.status(400).json({ error: 'Invalid lineId' });
    }
    res.json({ lineId, start, end });
  });

  app.get('/api/check', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
