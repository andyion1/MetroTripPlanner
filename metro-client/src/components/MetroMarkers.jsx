import { Icon  } from 'leaflet';
import { 
  Marker,
  Popup,
  Polyline
} from 'react-leaflet';

import markerImage from '../assets/marker-icon.png';

const customIcon = new Icon({
  iconUrl: markerImage,
  iconSize: [38, 38],
  iconAnchor: [22, 30]
});

export default function MetroMarkers({route}) {
  const points = route.map(position => position.coordinates);
  //beware, hardcoded!!!
  return (
    <>
      <Marker position={route[0].coordinates} icon={customIcon} >
        <Popup><p>A point</p></Popup>
      </Marker>
      <Marker position={route[1].coordinates} icon={customIcon} />
      <Marker position={route[2].coordinates} icon={customIcon} />
      <Polyline pathOptions={{color: route[0].color}} positions={points} />
    </>
  );
}