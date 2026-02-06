import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import ControlPanel from './components/ControlPanel';
import { fetchAnalysis } from './api';
import './App.css';

function App() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (location, metric) => {
    setLoading(true);
    try {
      const result = await fetchAnalysis(location, metric);
      if (result.status === 'success') {
        setGeoData(result.data);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <ControlPanel onAnalyze={handleAnalyze} loading={loading} />
      </div>
      <div className="map-container">
        <MapComponent geoData={geoData} />
      </div>
    </div>
  );
}

export default App;