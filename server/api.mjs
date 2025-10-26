import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, '../metro-client/dist')));

let stationData = [];

// Filter the dataset to keep only relevant STM metro stations
function isRelevantStation(feature) {
  const route = feature.properties?.route_id;
  const url = feature.properties?.stop_url;
  return url && ['1', '2', '4', '5'].includes(route);
}

// Load the STM geojson data once before the server starts
async function loadStationData() {
  const filePath = path.join(__dirname, 'data', 'stm_arrets_sig.geojson');
  const data = await fs.readFile(filePath, 'utf-8');
  const jsonData = JSON.parse(data);
  stationData = jsonData.features.filter(isRelevantStation);
}

// Get all stations belonging to a specific metro line
function getStationsOnLine(stations, lineId) {
  return stations.filter(f => String(f.properties.route_id) === String(lineId));
}

// Find the position of the start and end stations on a metro line
function getStationIndices(stations, start, end) {
  const names = stations.map(f => f.properties.stop_name);
  return {
    startIndex: names.indexOf(start),
    endIndex: names.indexOf(end)
  };
}

// Return all stations between two indices (inclusive)
function getStationsBetween(stations, startIndex, endIndex) {
  if (startIndex <= endIndex) {
    return stations.slice(startIndex, endIndex + 1);
  } else {
    return stations.slice(endIndex, startIndex + 1).reverse();
  }
}

// Once the station data is loaded, register API endpoints
loadStationData().then(() => {
  app.get('/api/stations', (req, res) => {
    res.json(stationData);
  });

  // Returns all stations belonging to a specific line
  app.get('/api/line/:lineId', (req, res) => {
    const { lineId } = req.params;
    if (!['1', '2', '4', '5'].includes(lineId)) {
      return res.status(400).json({ error: 'Invalid metro line id' });
    }
    const stations = getStationsOnLine(stationData, lineId);
    res.json(stations);
  });


  // Returns all stations between a given start and end station
  app.get('/api/between', (req, res) => {
    const { lineId, start, end } = req.query;
    if (!lineId || !start || !end) {
      return res.status(400).json({ error: 'Missing lineId, start, or end' });
    }
    if (!['1', '2', '4', '5'].includes(lineId)) {
      return res.status(400).json({ error: 'Invalid lineId' });
    }

    const lineStations = getStationsOnLine(stationData, lineId);


    const { startIndex, endIndex } = getStationIndices(lineStations, start, end);
    if (startIndex === -1 || endIndex === -1) {
      return res.status(404).json({ error: 'Start or end station not found on this line' });
    }
    const segment = getStationsBetween(lineStations, startIndex, endIndex);
    res.json(segment);
  });

  // Health check endpoint to confirm server is running (I added it even though it was optional)
  app.get('/api/check', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start the Express server
  const server = app.listen(port, () => {
  });

  
  // Shutdown when the process ends
  function shutdown() {
    server.close(() => {
      process.exit(0);
    });
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

});
