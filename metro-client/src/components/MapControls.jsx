export default function MapControls({
  startStation,
  endStation,
  uniqueStationNames,
  lineStations,
  setStartStation,
  setEndStation
}) {
  return (
    <div id="controls-section">
      <div className="control-group">
        <label htmlFor="startSelect">Start Station:</label>
        <select
          id="startSelect"
          value={startStation}
          onChange={e => setStartStation(e.target.value)}
        >
          <option value="">Select a station</option>
          {uniqueStationNames.map(name =>
            <option key={name} value={name}>
              {name}
            </option>
          )}
        </select>
      </div>

      {startStation &&
        <div className="control-group">
          <label htmlFor="endSelect">End Station:</label>
          <select
            id="endSelect"
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
      }
    </div>
  );
}
