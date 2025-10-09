import { 
  MapContainer, 
  TileLayer,
  Marker
} from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// See https://www.youtube.com/watch?v=jD6813wGdBA if you want to customize the map
// further (optional)

export default function MapExample() {
  const [stations, setStations] = useState([]);
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  const [lineStations, setLineStations] = useState([]);
  const [segment, setSegment] = useState([]);

  useEffect(() => {
    if (!startStation) {
      setLineStations([]);
      return;
    }

    const selected = stations.find(s => s.properties.stop_name === startStation);
    if (!selected) return;

    const lineId = selected.properties.route_id;

    const sameLine = stations.filter(s => s.properties.route_id === lineId);
    setLineStations(sameLine);
  }, [startStation, stations]);

  useEffect(() => {
    if (!startStation || !endStation) {
      setSegment([]);
      return;
    }

    // find lineId from the start station
    const selected = stations.find(s => s.properties.stop_name === startStation);
    if (!selected) return;
    const lineId = selected.properties.route_id;

    // fetch stations between start and end
    fetch(`/api/between?lineId=${lineId}&start=$
    {encodeURIComponent(startStation)}&end=${encodeURIComponent(endStation)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSegment(data);
      })
      .catch(err => console.error('Failed to fetch stations between:', err));
  }, [startStation, endStation, stations]);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Failed to load stations:', err));
  }, []);

  // Get unique station names for dropdown
  const uniqueStationNames = Array.from(
    new Set(stations.map(station => station.properties.stop_name))
  );

  const attribution = 
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="ui-container">
      <div className="ui-controls">
        <div>
          <label>Start Station: </label>
          <select
            value={startStation}
            onChange={e => setStartStation(e.target.value)}
          >
            <option value="">Select a station</option>
            {uniqueStationNames.map(name =>
              <option key={name} value={name}>{name}</option>
            )}
          </select>
        </div>

        <div>
          <label>End Station: </label>
          <select
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
      </div>

      <MapContainer
        center={[45.5, -73.6]}
        zoom={12}
        zoomControl={true}
        updateWhenZooming={false}
        updateWhenIdle={true}
        preferCanvas={true}
        minZoom={10}
        maxZoom={16}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />
        {(segment.length > 0 ? segment : stations).map((station, index) =>
          <Marker
            key={`${station.properties.stop_id}-${index}`}
            position={[
              station.geometry.coordinates[1],
              station.geometry.coordinates[0]
            ]}
          />
        )}
      </MapContainer>
    </div>
  );
}