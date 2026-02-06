import React, { useState } from 'react';

const ControlPanel = ({ onAnalyze, loading }) => {
  const [location, setLocation] = useState("Moratuwa, Sri Lanka");
  const [metric, setMetric] = useState("betweenness");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(location, metric);
  };

  return (
    <div className="control-panel">
      <h3>GIS Analytics</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Location (City, Country)</label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Metric</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="betweenness">Betweenness Centrality</option>
            <option value="closeness">Closeness Centrality</option>
            <option value="connectivity">Connectivity (Degree)</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Computing...' : 'Analyze Network'}
        </button>
      </form>
      
      <div className="legend">
        <h4>Legend</h4>
        <div className="gradient-bar"></div>
        <div className="labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;