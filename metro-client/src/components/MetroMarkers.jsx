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
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    const cleaned = name
      .replace(/^Station\s+/i, '')
      .replace(/\s+/g, '_') 
      .replace(/-_/g, '-');

    const query = `${cleaned}_Station`;

    async function fetchWiki() {
      try {
        const url =
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
          `&list=search&formatversion=2&srsearch=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
          headers: { 'Api-User-Agent': 'andy.ionita@dawsoncollege.qc.ca' },
        });

        const data = await res.json();

        const first = data?.query?.search?.[0];
        if (first) {
          setSummary(first.snippet.replace(/<\/?[^>]+(>|$)/g, '') + '…');
          setPageUrl(`https://en.wikipedia.org/?curid=${first.pageid}`);
        } else {
          setSummary('No Wikipedia summary found.');
        }
      } catch (err) {
        console.error(err);
        setSummary('Error loading summary.');
      }
    }

    fetchWiki();
  }, [name]);

  return (
    <div style={{ maxWidth: 250 }}>
      <strong>{name}</strong>
      <p
        style={{ fontSize: '14px', color: '#444' }}
        dangerouslySetInnerHTML={{ __html: summary }}
      />
      {pageUrl && (
        <p>
          <a href={pageUrl} target="_blank" rel="noreferrer">
            Read more on Wikipedia
          </a>
        </p>
      )}
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
