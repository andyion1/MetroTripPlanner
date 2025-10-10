import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, '../metro-client/dist')));

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

function getStationsOnLine(stations, lineId) {
  return stations.filter(f => String(f.properties.route_id) === String(lineId));
}


function getStationIndices(stations, start, end) {
  const names = stations.map(f => f.properties.stop_name);
  return {
    startIndex: names.indexOf(start),
    endIndex: names.indexOf(end)
  };
}

function getStationsBetween(stations, startIndex, endIndex) {
  if (startIndex <= endIndex) {
    return stations.slice(startIndex, endIndex + 1);
  } else {
    return stations.slice(endIndex, startIndex + 1).reverse();
  }
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
    const stations = getStationsOnLine(stationData, lineId);
    res.json(stations);
  });


  app.get('/api/between', (req, res) => {
    const { lineId, start, end } = req.query;
    console.log('>>> /api/between called');
    console.log('Query:', req.query);
    if (!lineId || !start || !end) {
      return res.status(400).json({ error: 'Missing lineId, start, or end' });
    }
    if (!['1', '2', '4', '5'].includes(lineId)) {
      return res.status(400).json({ error: 'Invalid lineId' });
    }

    const lineStations = getStationsOnLine(stationData, lineId);

    console.log('Stations on line:', lineStations.length);
    console.log('First few:', lineStations.slice(0, 3).map(s => s.properties.stop_name));

    const { startIndex, endIndex } = getStationIndices(lineStations, start, end);
    console.log('Indices:', startIndex, endIndex);
    if (startIndex === -1 || endIndex === -1) {
      return res.status(404).json({ error: 'Start or end station not found on this line' });
    }
    const segment = getStationsBetween(lineStations, startIndex, endIndex);
    res.json(segment);
  });

  app.get('/api/check', (req, res) => {
    res.json({ status: 'ok' });
  });

  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });

  function shutdown() {
    console.debug('SIGTERM signal received: closing HTTP server')
    server.close(() => {
      console.debug('HTTP server closed')
      process.exit(0);
    });
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

});
