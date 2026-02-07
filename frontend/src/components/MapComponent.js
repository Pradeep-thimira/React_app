import React, { useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const BASEMAPS = {
  'Dark Matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'Positron': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  'Terrain': 'https://demotiles.maplibre.org/style.json'
};

const MapComponent = ({ geoData }) => {
  const [mapStyle, setMapStyle] = useState(BASEMAPS['Dark Matter']);
  const [layersVisible, setLayersVisible] = useState({
    input: true,
    analysis: true
  });
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  const initialViewState = {
    longitude: 79.86,
    latitude: 6.92,
    zoom: 12
  };

  // 1. Analysis Layer (The colored results)
  const analysisLayerStyle = {
    id: 'analysis-layer',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      'visibility': layersVisible.analysis ? 'visible' : 'none'
    },
    paint: {
      'line-width': 3,
      'line-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0, '#3288bd',    // Blue
        0.5, '#ffffbf',  // Yellow
        1, '#d53e4f'     // Red
      ],
      'line-opacity': 0.8
    }
  };

  // 2. Input Layer (The raw road network - essentially a background for the analysis)
  // We can render the same data but with a neutral color underneath or if toggle analysis off
  const inputLayerStyle = {
    id: 'input-layer',
    type: 'line',
    layout: {
        'visibility': layersVisible.input ? 'visible' : 'none'
    },
    paint: {
      'line-width': 1,
      'line-color': '#888',
      'line-opacity': 0.5
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
      >
        <NavigationControl position="top-left" />

        {geoData && (
          <Source type="geojson" data={geoData}>
            {/* Render input layer first (below) */}
            <Layer {...inputLayerStyle} />
            {/* Render analysis layer on top */}
            <Layer {...analysisLayerStyle} />
          </Source>
        )}
      </Map>

      {/* Layer Control Panel (Top Right) */}
      <div className="layer-panel">
        <div className="layer-header">
            <h4>Layers</h4>
            <button onClick={() => setShowLayerPanel(!showLayerPanel)}>
                {showLayerPanel ? '−' : '+'}
            </button>
        </div>
        
        {showLayerPanel && (
            <div className="layer-content">
                <div className="layer-section">
                    <h5>Base Map</h5>
                    <select 
                        value={Object.keys(BASEMAPS).find(key => BASEMAPS[key] === mapStyle)} 
                        onChange={(e) => setMapStyle(BASEMAPS[e.target.value])}
                    >
                        {Object.keys(BASEMAPS).map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="layer-section">
                    <h5>Overlays</h5>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={layersVisible.input} 
                            onChange={(e) => setLayersVisible({...layersVisible, input: e.target.checked})}
                        /> Input Network
                    </label>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={layersVisible.analysis} 
                            onChange={(e) => setLayersVisible({...layersVisible, analysis: e.target.checked})}
                        /> Analysis Result
                    </label>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;