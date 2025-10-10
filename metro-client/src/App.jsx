import './App.css';
import Header from './components/Header';
import MapExample from './components/MapExample';

export default function App() {
  // Root component for the Metro Trip Planner app
  // Defines the main layout with a header and a map section
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <MapExample />
      </main>
    </div>
  );
}
