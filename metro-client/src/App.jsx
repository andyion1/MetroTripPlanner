import './App.css';
import MapExample from './components/MapExample';

export default function App() {
  return (
    <div className="app-top">
      <header className="app-header">
        <h1 className="app-title">Metro Trip Planner</h1>
        <p className="app-subtitle">Select Start and End Stations</p>
      </header>

      <main className="app-main">
        <MapExample />
      </main>
    </div>
  );
}
