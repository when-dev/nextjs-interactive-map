import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
mapboxgl.accessToken = mapboxToken;

interface MapProps {
  onBuildingSelect: (buildingId: string, height: number, address: string) => void;
  selectedBuildings: { id: string, height: number }[];
  onClearBuildingSelection: (buildingId: string) => void;
  onClearAllSelections: () => void;
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
    const { house_number, road, city, country } = data.address || {};
    const fullAddress = `${house_number || ''} ${road || ''}, ${city || ''}, ${country || ''}`.trim();
    return fullAddress !== ', , , , ' ? fullAddress : 'Unknown Address';
  } catch (error) {
    console.error('Error in reverseGeocode:', error);
    return 'Error retrieving address';
  }
};

const Map: React.FC<MapProps> = ({
  onBuildingSelect,
  selectedBuildings,
  onClearBuildingSelection,
  onClearAllSelections,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);

  const handleMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const hoveredBuildingId = e.features[0].id as string | undefined;
      if (hoveredBuildingId) {
        mapRef.current?.setFeatureState(
          { source: 'composite', sourceLayer: 'building', id: hoveredBuildingId },
          { hover: true }
        );
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const features = map.querySourceFeatures('composite', { sourceLayer: 'building' });
    features.forEach((feature) => {
      const buildingId = feature.id as string | undefined;
      if (buildingId) {
        map.setFeatureState(
          { source: 'composite', sourceLayer: 'building', id: buildingId },
          { hover: false }
        );
      }
    });
  }, []);

  const handleClick = useCallback(
    async (e: mapboxgl.MapMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const buildingId = feature.id as string | undefined;
        const height = feature.properties?.height as number;
        if (buildingId && feature.geometry.type === 'Polygon') {
          const coordinates = (feature.geometry as GeoJSON.Polygon).coordinates;
          const [lng, lat] = coordinates[0][0];
          const address = await reverseGeocode(lng, lat);
          onBuildingSelect(buildingId, height, address);
        }
      }
    },
    [onBuildingSelect]
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [76.9454, 43.2566], // Алматы
      zoom: 15,
      pitch: 60,
      bearing: -17.6,
    });

    newMap.touchZoomRotate.enable();
    newMap.dragRotate.enable();

    newMap.on('styledata', () => {
      setStyleLoaded(true);
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
              ['in', ['id'], ['literal', selectedBuildings.map((b) => b.id)]],
              '#ff0000',
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#ff9999',
                '#aaa',
              ],
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
          layout: {
            'visibility': 'visible',
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
              ['in', ['id'], ['literal', selectedBuildings.map((b) => b.id)]],
              'transparent',
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(255, 0, 0, 0.5)',
                'transparent',
              ],
            ],
            'line-width': 2,
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
    const map = mapRef.current;
    if (map && styleLoaded) {
      if (map.getLayer('3d-buildings')) {
        map.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
          'case',
          ['in', ['id'], ['literal', selectedBuildings.map((b) => b.id)]],
          '#ff0000',
          [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#ff9999',
            '#aaa',
          ],
        ]);

        if (selectedBuildings.length === 0) {
          map.setPaintProperty('3d-buildings', 'fill-extrusion-height', ['get', 'height']);
        } else {
          const heightCases: any[] = [];
          selectedBuildings.forEach((building) => {
            heightCases.push(['==', ['id'], building.id]);
            heightCases.push(building.height);
          });
          heightCases.push(['get', 'height']);

          map.setPaintProperty('3d-buildings', 'fill-extrusion-height', ['case', ...heightCases]);
        }
      }
    }
  }, [selectedBuildings, styleLoaded]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default Map;
