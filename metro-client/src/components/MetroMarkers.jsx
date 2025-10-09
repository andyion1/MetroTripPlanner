import { Icon } from 'leaflet';
import { Marker, Polyline, Popup } from 'react-leaflet';
import markerImage from '../assets/marker-icon.png';

const customIcon = new Icon({
  iconUrl: markerImage,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

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
            <strong>{station.properties.stop_name}</strong>
          </Popup>
        </Marker>
      ))}


      {coordinates.length > 1 && (
        <Polyline positions={coordinates} pathOptions={{ color: lineColor, weight: 5 }} />
      )}
    </>
  );
}
