import React, { useEffect, useRef, useState } from 'react';
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
  const [mapLoaded, setMapLoaded] = useState(false);

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
              '#ff0000', 
              ['case',
                ['boolean', ['feature-state', 'hover'], false],
                '#ff9999',  // Светло-красный цвет при наведении
                '#aaa'
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
              '#000000',
              ['case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(255, 0, 0, 0.5)',  // Полупрозрачный красный цвет при наведении
                'transparent'
              ]
            ],
            'line-width': 2
          },
        });
      }

      // Обработчик наведения курсора
      let hoveredBuildingId: string | null = null;

      newMap.on('mousemove', '3d-buildings', (e) => {
        if (e.features && e.features.length > 0) {
          if (hoveredBuildingId !== null) {
            newMap.setFeatureState(
              { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
              { hover: false }
            );
          }
          hoveredBuildingId = e.features[0].id as string;
          newMap.setFeatureState(
            { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
            { hover: true }
          );
        } else {
          // Если нет features под курсором, сбрасываем состояние наведения
          if (hoveredBuildingId !== null) {
            newMap.setFeatureState(
              { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
              { hover: false }
            );
            hoveredBuildingId = null;
          }
        }
      });

      // Сброс состояния при уходе курсора с здания
      newMap.on('mouseleave', '3d-buildings', () => {
        if (hoveredBuildingId !== null) {
          newMap.setFeatureState(
            { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
            { hover: false }
          );
          hoveredBuildingId = null;
        }
      });

      newMap.on('click', '3d-buildings', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const buildingId = feature.id as string;
          const height = feature.properties?.height as number;
          // const coordinates = feature.geometry.coordinates;
          // console.log(coordinates);
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
  }, []);

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      if (selectedBuilding) {
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['==', ['id'], selectedBuilding],
          '#ff0000', 
          ['case',
            ['boolean', ['feature-state', 'hover'], false],
            '#ff9999',  // Светло-красный цвет при наведении
            '#aaa'
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
        // Сброс цвета, если нет выбранного здания
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#ff9999',  // Светло-красный цвет при наведении
          '#aaa'
        ]);
      }
    }
  }, [selectedBuilding, buildingHeight, mapLoaded]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default Map;