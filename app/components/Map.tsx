import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import BuildingInfo from './BuildingInfo';
import HeightControl from './HeightControl';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

mapboxgl.accessToken = mapboxToken;

interface MapProps {
  onBuildingSelect: (buildingId: string, height: number) => void;
  onIncreaseHeight: () => void;
  onResetHeight: () => void;
}

const Map: React.FC<MapProps> = ({
  onBuildingSelect,
  onIncreaseHeight,
  onResetHeight,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [buildingHeight, setBuildingHeight] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
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

      newMap.on('click', '3d-buildings', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const buildingId = feature.id as string;
          const height = feature.properties?.height as number;

          onBuildingSelect(buildingId, height);
          setSelectedBuilding(buildingId);
          setOriginalHeight(height);
          setBuildingHeight(height);
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

  const handleIncreaseHeight = () => {
    if (selectedBuilding && buildingHeight !== null) {
      const newHeight = buildingHeight + 10;
      setBuildingHeight(newHeight);
      onIncreaseHeight();
    }
  };

  const handleResetHeight = () => {
    if (selectedBuilding && originalHeight !== null) {
      setBuildingHeight(originalHeight);
      onResetHeight();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full"></div>

      {selectedBuilding && (
        <BuildingInfo buildingId={selectedBuilding} height={buildingHeight} />
      )}

      <HeightControl
        onIncreaseHeight={handleIncreaseHeight}
        onResetHeight={handleResetHeight}
      />
    </div>
  );
};

export default Map;