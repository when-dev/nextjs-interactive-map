import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
mapboxgl.accessToken = mapboxToken;

interface MapProps {
  onBuildingSelect: (buildingId: string, height: number) => void;
  selectedBuilding: string | null;
  buildingHeight: number | null;
}

const Map: React.FC<MapProps> = ({ onBuildingSelect, selectedBuilding, buildingHeight }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [76.9454, 43.2566], // Алматы
      zoom: 15,
    });

    newMap.on('load', () => {
      newMap.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
          
        },
      });

      newMap.on('click', '3d-buildings', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const buildingId = feature.id as string;
          const height = feature.properties?.height as number;

          onBuildingSelect(buildingId, height);
        }
      });
    });

    mapRef.current = newMap;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [onBuildingSelect]);

 useEffect(() => {
  if (mapRef.current && selectedBuilding && buildingHeight !== null) {
    mapRef.current.setFeatureState(
      { source: 'composite', sourceLayer: 'building', id: selectedBuilding },
      { height: buildingHeight }
    );
    mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-height', [
      'case',
      ['==', ['id'], selectedBuilding],
      buildingHeight,
      ['get', 'height'],
    ]);
  }
}, [selectedBuilding, buildingHeight]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default Map;
