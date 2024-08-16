import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
mapboxgl.accessToken = mapboxToken;

interface MapProps {
  onBuildingSelect: (buildingId: string, height: number, address: string) => void;
  selectedBuilding: string | null;
  buildingHeight: number | null;
}

const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return 'Unknown Address';
    }
    const data = await response.json();

    // Извлечение данных адреса
    const { house_number, road, city, state, country } = data.address || {};
    const fullAddress = `${house_number || ''} ${road || ''}, ${city || ''}, ${country || ''}`.trim();

    return fullAddress !== ', , , , ' ? fullAddress : 'Unknown Address';
  } catch (error) {
    console.error('Error in reverseGeocode:', error);
    return 'Error retrieving address';
  }
};


const Map: React.FC<MapProps> = ({ onBuildingSelect, selectedBuilding, buildingHeight }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const hoveredBuildingId = e.features[0].id as string;
      mapRef.current?.setFeatureState(
        { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
        { hover: true }
      );
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const features = map.querySourceFeatures('composite', { sourceLayer: 'building' });
    features.forEach((feature) => {
      const buildingId = feature.id as string;
      map.setFeatureState(
        { source: 'composite', sourceLayer: 'building', id: buildingId },
        { hover: false }
      );
    });
  }, []);

  const handleClick = useCallback(async (e: mapboxgl.MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const buildingId = feature.id as string;
      const height = feature.properties?.height as number;
  
     
      if (feature.geometry.type === 'Polygon') {
        const coordinates = (feature.geometry as GeoJSON.Polygon).coordinates;
        const [lng, lat] = coordinates[0][0];
  
        // Обратное геокодирование для получения адреса
        const address = await reverseGeocode(lng, lat);
  
        onBuildingSelect(buildingId, height, address);
      }
    }
  }, [onBuildingSelect]);

  
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [76.9454, 43.2566], // Алматы
      zoom: 15,
    });

    newMap.on('load', () => {
      setMapLoaded(true);

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
              '#ff0000', // Красный цвет для выбранного здания
              ['case',
                ['boolean', ['feature-state', 'hover'], false],
                '#ff9999', // Светло-красный цвет при наведении
                '#aaa' // Цвет по умолчанию
              ]
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
              '#000000', // Черный цвет для обводки выбранного здания
              ['case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(255, 0, 0, 0.5)', // Полупрозрачный красный цвет при наведении
                'transparent' // Прозрачный цвет по умолчанию
              ]
            ],
            'line-width': 2
          },
        });
      }

      newMap.on('mousemove', '3d-buildings', handleMouseMove);
      newMap.on('mouseleave', '3d-buildings', handleMouseLeave);
      newMap.on('click', '3d-buildings', handleClick);
    });

    mapRef.current = newMap;

    return () => {
      if (mapRef.current) {
        mapRef.current.off('mousemove', '3d-buildings', handleMouseMove);
        mapRef.current.off('mouseleave', '3d-buildings', handleMouseLeave);
        mapRef.current.off('click', '3d-buildings', handleClick);
        mapRef.current.remove();
      }
    };
  }, [handleMouseMove, handleMouseLeave, handleClick]);

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      if (selectedBuilding) {
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['==', ['id'], selectedBuilding],
          '#ff0000', // Красный цвет для выбранного здания
          ['case',
            ['boolean', ['feature-state', 'hover'], false],
            '#ff9999', // Светло-красный цвет при наведении
            '#aaa' // Цвет по умолчанию
          ]
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
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#ff9999', // Светло-красный цвет при наведении
          '#aaa' // Цвет по умолчанию
        ]);
      }
    }
  }, [selectedBuilding, buildingHeight, mapLoaded]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default Map;
