# Metro Trip Planner - Andy Ionita, 2333068

This web application helps users plan metro trips by selecting start and end stations.  
It displays all stations between them on the line. It shows markers on a map and even provides Wikipedia info for each station. 

---

## Requirements

- **Start and End Stations**
    - Choosing a start station and an end station shows all stations between them on the same line.
    - End station choices are limited to stations on the same line as the start.

- **Map Interactions**
    - Metro stations are displayed as map markers.
    - Clicking a marker highlights the station and fetches info from the Wikipedia API.
    - Popup shows station details.

- **Station Data**
    - Uses STM geojson file as data source.
    - Server reads the file once and caches it in memory.
    - Data only includes relevant metro lines.
    - On server start: read the file; if successful, server starts listening.

- **React UI**
    - Dropdown forms to select start and end stations.
    - Map component with markers, lines, and popups.
    - When form data changes → update map and re-read updated data.
    - UI must be usable on both desktop and mobile.

- **Server Responsibilities**
    - Express server reads STM station data once before handling requests.
    - Provides REST API routes to get all stations
    - Serves static routes that include the React components

- **Client Responsibilities**
  - React app fetches from Express AP
  - React components communicate with props and state.
  - Wikipedia API used to show basic station info.
  - Must update map and data dynamically when form changes.

---

## Additional information

    - Select start + end stations will make the user see all stations in between on the map.  
    - Clicking markers will show station info from Wikipedia.  
    - System reads STM data once at startup so that it's fast and efficient.  
    - Works on both mobile and desktop.  
    - Express server and React UI run together on the same origin.  

---

## APIs and Data

- STM GeoJSON file will provide station and line data 
- Wikipedia API will be used to fetch descriptions of metro stations
- ReactiveUI will be used for state, navigation and UI handling

---

## Attribution

- STM Open Data (GeoJSON stations file)  
- [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) for map display  
- Wikipedia API for station details  

