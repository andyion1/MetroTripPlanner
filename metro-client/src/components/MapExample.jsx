import { 
  MapContainer, 
  TileLayer
} from 'react-leaflet';
import { useState, useEffect } from 'react';
import MetroMarkers from './MetroMarkers';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// See https://www.youtube.com/watch?v=jD6813wGdBA if you want to customize the map
// further (optional)

export default function MapExample() {

  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetch('/api/stations').then(res => res.json()).then(data => setStations(data));
  }, []);

  // Temporary demo points for now
  const points =  [ 
    {
      name: 'one',
      coordinates: [45.446465999988021, -73.603118],
      color: 'lime'
    },
    {
      name: 'two',
      coordinates: [45.501342315993, -73.60383900042255],
      color: 'lime'
    },
    {
      name: 'three',
      coordinates: [45.520830163089066, -73.58006390089389],
      color: 'lime'
    },
  ];
  const attribution = 
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  // TODO this is a demo of react-leaflet.  Feel free to modify the CSS.
  return (
    <div className="ui-container">
      {/* See leaflet-container CSS class */}
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
        <MetroMarkers route={points}/> 
      </MapContainer>
    </div>
  );
}