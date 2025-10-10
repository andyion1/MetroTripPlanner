import { MapContainer, TileLayer } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MetroMarkers from './MetroMarkers';

export default function MapExample() {

  // Stores the full list of stations from the server
  const [stations, setStations] = useState([]);

  // Selected start and end station names
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');

  // Stores stations that belong to the same metro line as the selected start
  const [lineStations, setLineStations] = useState([]);

  // The list of stations between start and end
  const [segment, setSegment] = useState([]);

  // Loading indicator while fetching data
  const [loading, setLoading] = useState(true);


  // When the start station changes, find its line and fetch other stations on that same line
  useEffect(() => {
    if (!startStation) {
      setLineStations([]);
      return;
    }

    const selected = stations.find(s => s.properties.stop_name === startStation);
    if (!selected) return;

    const lineId = selected.properties.route_id;

    fetch(`/api/line/${lineId}`).then(res => res.json()).then(data => {
      setLineStations(data);
      // Reset end and segment when switching to another line
      setEndStation('');
      setSegment([]);
    }).catch(err => console.error('Failed to fetch line stations:', err));
  }, [startStation, stations]);

  // When start or end station changes, fetch the segment between them
  useEffect(() => {
    if (!startStation || !endStation) {
      setSegment([]);
      return;
    }

    const startFeature = stations.find(
      s => s.properties.stop_name === startStation
    );
    const endFeature = stations.find(
      s => s.properties.stop_name === endStation
    );

    // Prevent fetching if they are not on the same metro line
    if (
      !startFeature ||
      !endFeature ||
      startFeature.properties.route_id !== endFeature.properties.route_id
    ) {
      setSegment([]);
      return;
    }

    const lineId = startFeature.properties.route_id;

    fetch(
      `/api/between?lineId=${lineId}` +
        `&start=${encodeURIComponent(startStation)}` +
        `&end=${encodeURIComponent(endStation)}`
    ).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setSegment(data);
    }).catch(err => console.error('Failed to fetch stations between:', err));
  }, [startStation, endStation, stations]);

  useEffect(() => {
    fetch('/api/stations').then(res => res.json()).then(data => {
      setStations(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load stations:', err);
      setLoading(false);
    });
  }, []);

  // Remove duplicates from station list for dropdown
  const uniqueStationNames = Array.from(
    new Set(stations.map(station => station.properties.stop_name))
  );

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Show loading screen before stations data is available
  if (loading) {
    return <div id="loading-view">Loading metro data...</div>;
  }

  // Converts metro line ID into its color name
  function getLineName(routeId) {
    const names = { 1: 'Green', 2: 'Orange', 4: 'Yellow', 5: 'Blue' };
    return names[routeId] || 'Metro';
  }

  // Returns the CSS class used to color the chips for each line
  function getLineClass(routeId) {
    const map = { 1: 'green-line', 2: 'orange-line', 4: 'yellow-line', 5: 'blue-line' };
    return map[routeId] || 'default-line';
  }

  // Main rendering
  return (
    <div id="map-ui">
      <div id="controls-section">
        <div className="control-group">
          <label htmlFor="startSelect">Start Station:</label>
          <select
            id="startSelect"
            value={startStation}
            onChange={e => setStartStation(e.target.value)}
          >
            <option value="">Select a station</option>
            {uniqueStationNames.map(name =>
              <option key={name} value={name}>
                {name}
              </option>
            )}
          </select>
        </div>

        {startStation &&
          <div className="control-group">
            <label htmlFor="endSelect">End Station:</label>
            <select
              id="endSelect"
              value={endStation}
              onChange={e => setEndStation(e.target.value)}
            >
              <option value="">Select a station</option>
              {lineStations.map(s =>
                <option
                  key={`${s.properties.stop_id}-end`}
                  value={s.properties.stop_name}
                >
                  {s.properties.stop_name}
                </option>
              )}
            </select>
          </div>
        }
      </div>

      {startStation && endStation &&
        <>
          {segment.length > 0 &&
            <div id="chips-container">
              <p id="line-title">
                {getLineName(segment[0]?.properties?.route_id)} Line – {segment.length} stations
              </p>
              <div id="chip-row">
                {segment.map(s =>
                  <span
                    key={s.properties.stop_id}
                    className={`chip ${getLineClass(s.properties.route_id)}`}
                  >
                    {s.properties.stop_name.replace(/^Station\s+/i, '')}
                  </span>
                )}
              </div>
            </div>
          }

          <div id="map-area">
            <MapContainer
              center={[45.5, -73.6]}
              zoom={12}
              zoomControl
              updateWhenIdle
              preferCanvas
              minZoom={10}
              maxZoom={16}
            >
              <TileLayer attribution={attribution} url={tileUrl} />
              <MetroMarkers data={segment.length > 0 ? segment : stations} />
            </MapContainer>
          </div>
        </>
      }
    </div>
  );
}
