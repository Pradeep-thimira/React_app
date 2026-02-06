import React, { useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = ({ geoData }) => {
  
  // Define initial view state (optional, can be dynamic)
  const initialViewState = {
    longitude: 79.88,
    latitude: 6.77, // Moratuwa
    zoom: 13
  };

  // Layer Style for the Analysis Points (Intersections)
  // We use data-driven styling: circle color changes based on 'centrality' property
  const layerStyle = {
    id: 'data-point',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'centrality'],
        0, '#3288bd',    // Blue for low
        0.5, '#ffffbf',  // Yellow for medium
        1, '#d53e4f'     // Red for high
      ],
      'circle-opacity': 0.8,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  return (
    <Map
      initialViewState={initialViewState}
      style={{width: '100%', height: '100%'}}
      mapStyle="https://demotiles.maplibre.org/style.json" // Free OSM Vector Style
    >
      {geoData && (
        <Source type="geojson" data={geoData}>
          <Layer {...layerStyle} />
        </Source>
      )}
    </Map>
  );
};

export default MapComponent;