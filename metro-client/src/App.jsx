import './App.css';
import MapExample from './components/MapExample';

export default function App() {
  // Root component for the Metro Trip Planner app
  // Defines the main layout with a header and a map section
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Metro Trip Planner</h1>
        <p className="app-subtitle">Select Start and End Stations</p>

        <div id="header-controls-slot" />
      </header>

      <main className="app-main">
        <MapExample />
      </main>
    </div>
  );
}