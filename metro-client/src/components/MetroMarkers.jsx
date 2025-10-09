import { Icon } from 'leaflet';
import { Marker, Polyline, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import markerImage from '../assets/marker-icon.png';

const customIcon = new Icon({
  iconUrl: markerImage,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

function WikiSummary({ name }) {
  const [summary, setSummary] = useState('Loading Wikipedia summary...');

  useEffect(() => {
    const cleaned = name.replace(/^Station\s+/i, '').trim();
    const query = `${cleaned} station (Montreal Metro)`;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.extract) {
          setSummary(data.extract);
        } else {
          setSummary('No Wikipedia summary found.');
        }
      })
      .catch(() => setSummary('Error loading summary.'));
  }, [name]);

  return (
    <div style={{ maxWidth: 250 }}>
      <strong>{name}</strong>
      <p style={{ fontSize: '14px', color: '#444' }}>{summary}</p>
    </div>
  );
}


export default function MetroMarkers({ data }) {
  if (!data || data.length === 0) return null;

  const coordinates = data.map(station => [
    station.geometry.coordinates[1],
    station.geometry.coordinates[0]
  ]);

  const first = data[0];
  const colors = { 1: 'green', 2: 'orange', 4: 'yellow', 5: 'blue' };
  const lineColor = colors[first.properties.route_id] || '#555';

  return (
    <>
      {data.map((station, index) => (
        <Marker
          key={`${station.properties.stop_id}-${index}`}
          position={[
            station.geometry.coordinates[1],
            station.geometry.coordinates[0]
          ]}
          icon={customIcon}
        >
          <Popup>
            <WikiSummary name={station.properties.stop_name} />
          </Popup>

        </Marker>
      ))}


      {coordinates.length > 1 && (
        <Polyline positions={coordinates} pathOptions={{ color: lineColor, weight: 5 }} />
      )}
    </>
  );
}
