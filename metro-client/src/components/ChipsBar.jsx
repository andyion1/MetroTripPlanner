export default function ChipsBar({ segment, getLineName, getLineClass }) {
  return (
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
  );
}
