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

  useEffect(() => {
    fetch('/api/stations').then(res => res.json()).then(data => setStations(data));
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
        {stations.map(station =>
          <Marker
            key={station.properties.stop_id}
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