import React, { useState } from 'react';

const ControlPanel = ({ onAnalyze, loading }) => {
  const [file, setFile] = useState(null);
  const [metric, setMetric] = useState("betweenness");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
        alert("Please upload a zipped Shapefile.");
        return;
    }
    onAnalyze(file, metric);
  };

  const handleFileChange = (e) => {
      setFile(e.target.files[0]);
  };

  return (
    <div className="control-panel">
      <h3>Network Analysis</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload Shapefile (.zip)</label>
          <input 
            type="file" 
            accept=".zip"
            onChange={handleFileChange}
          />
          <small style={{color: '#666'}}>Must contain .shp, .shx, .dbf</small>
        </div>
        
        <div className="form-group">
          <label>Metric (Segment Analysis)</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="betweenness">Betweenness Centrality</option>
            <option value="closeness">Closeness Centrality (Avg)</option>
            <option value="connectivity">Connectivity (Degree)</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Analyze Network'}
        </button>
      </form>
      
      <div className="legend">
        <h4>Legend (Edges)</h4>
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