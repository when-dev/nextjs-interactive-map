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
      if (!newMap.getLayer('3d-buildings')) {
        newMap.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': [
              'case',
              ['==', ['id'], selectedBuilding],
              '#ff0000', 
              '#aaa' 
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
        });
      }

      
      if (!newMap.getLayer('building-outline')) {
        newMap.addLayer({
          id: 'building-outline',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'line',
          minzoom: 15,
          paint: {
            'line-color': [
              'case',
              ['==', ['id'], selectedBuilding],
              '#000000', 
              'transparent'  
            ],
            'line-width': 2  
          },
        });
      }

      
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
    if (mapRef.current) {
      if (selectedBuilding) {
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['==', ['id'], selectedBuilding],
          '#ff0000', 
          '#aaa'  
        ]);
        
        if (buildingHeight !== null) {
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
      } else {
        return;
      }
    }
  }, [selectedBuilding, buildingHeight]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default Map;
