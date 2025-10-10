import { 
  MapContainer, 
  TileLayer,
} from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MetroMarkers from './MetroMarkers';

// See https://www.youtube.com/watch?v=jD6813wGdBA if you want to customize the map
// further (optional)

export default function MapExample() {
  const [stations, setStations] = useState([]);
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  const [lineStations, setLineStations] = useState([]);
  const [segment, setSegment] = useState([]);
  const [loading, setLoading] = useState(true);


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
    fetch(
      `/api/between?lineId=${lineId}`
      + `&start=${encodeURIComponent(startStation)}`
      + `&end=${encodeURIComponent(endStation)}`
    )
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSegment(data);
      })
      .catch(err => console.error('Failed to fetch stations between:', err));
  }, [startStation, endStation, stations]);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        setStations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stations:', err);
        setLoading(false);
      });
  }, []);


  // Get unique station names for dropdown
  const uniqueStationNames = Array.from(
    new Set(stations.map(station => station.properties.stop_name))
  );

  const attribution = 
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  if (loading) {
    return <div className="loading-screen">Loading metro data...</div>;
  }

  function getLineColor(routeId) {
    const colors = { 1: '#2ecc71', 2: '#f39c12', 4: '#f1c40f', 5: '#2980b9' };
    return colors[routeId] || '#555';
  }

  function getLineName(routeId) {
    const names = { 1: 'Green', 2: 'Orange', 4: 'Yellow', 5: 'Blue' };
    return names[routeId] || 'Metro';
  }



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

        {startStation && (
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
        )}
      </div>

      {startStation && endStation && (
        <>
          {segment.length > 0 && (
            <div className="chips-bar">
              <p className="chips-line-label">
                {getLineName(segment[0]?.properties?.route_id)} Line: {segment.length} stations
              </p>
              <div className="chips-row">
                {segment.map((s) => (
                  <span
                    key={s.properties.stop_id}
                    className="station-chip"
                    style={{ backgroundColor: getLineColor(s.properties.route_id) }}
                  >
                    {s.properties.stop_name.replace(/^Station\s+/i, '')}
                  </span>
                ))}
              </div>
            </div>
          )}


          <div className="map-wrapper">
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
              <TileLayer attribution={attribution} url={tileUrl} />
              <MetroMarkers data={segment.length > 0 ? segment : stations} />
            </MapContainer>
          </div>
        </>
      )}

    </div>
  );
}