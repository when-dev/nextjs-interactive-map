import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const Map: React.FC = () => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [30.5234, 50.4501], // Киев
      zoom: 12,
    });

    map.on('load', () => {
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });

    return () => map.remove();
  }, []);

  return <div id="map" className="w-full h-full"></div>;
};

export default Map;
