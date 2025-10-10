import { MapContainer, TileLayer } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MetroMarkers from './MetroMarkers';
import MapControls from './MapControls';
import ChipsBar from './ChipsBar';

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
      setEndStation('');
      setSegment([]);
    }).catch(err => console.error('Failed to fetch line stations:', err));
  }, [startStation, stations]);

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

  const uniqueStationNames = Array.from(
    new Set(stations.map(station => station.properties.stop_name))
  );

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  if (loading) {
    return <div id="loading-view">Loading metro data...</div>;
  }

  function getLineName(routeId) {
    const names = { 1: 'Green', 2: 'Orange', 4: 'Yellow', 5: 'Blue' };
    return names[routeId] || 'Metro';
  }

  function getLineClass(routeId) {
    const map = { 1: 'green-line', 2: 'orange-line', 4: 'yellow-line', 5: 'blue-line' };
    return map[routeId] || 'default-line';
  }

  return (
    <div id="map-ui">
      <MapControls
        startStation={startStation}
        endStation={endStation}
        uniqueStationNames={uniqueStationNames}
        lineStations={lineStations}
        setStartStation={setStartStation}
        setEndStation={setEndStation}
      />

      {startStation && endStation &&
        <>
          {segment.length > 0 &&
            <ChipsBar
              segment={segment}
              getLineName={getLineName}
              getLineClass={getLineClass}
            />
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
