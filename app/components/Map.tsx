"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { BuildingInfo } from '../types';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

mapboxgl.accessToken = mapboxToken;

interface MapProps {
  onBuildingSelect: (buildingId: string, height: number) => void;
  onIncreaseHeight: () => void;
  onResetHeight: () => void;
}

const Map: React.FC<MapProps> = ({ onBuildingSelect, onIncreaseHeight, onResetHeight }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
    const [originalHeight, setOriginalHeight] = useState<number | null>(null);
    const [buildingHeight, setBuildingHeight] = useState<number | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const newMap = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12', 
          center: [76.9454, 43.2566], // Алматы
          zoom: 15,
          pitch: 45,
          bearing: -17.6,
          antialias: true,
      });

        newMap.on('style.load', () => {
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
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15, 0, // На уровне 15 зума высота 0
                        15.05, ['get', 'height'], // Чуть выше зума 15 - настоящая высота
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15, 0, // На уровне 15 зума нижняя граница высоты 0
                        15.05, ['get', 'min_height'], // Настоящая нижняя граница чуть выше зума 15
                    ],
                    'fill-extrusion-opacity': 0.6,
                }
            });

            newMap.on('click', '3d-buildings', (e) => {
                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    const buildingId = feature.id as string;
                    const height = feature.properties?.height as number;

                    if (!buildingId || height === undefined) {
                        console.error('Building does not have a valid id or height.');
                        return;
                    }

                    const buildingInfo = {
                        id: buildingId,
                        height: height,
                    };

                    setSelectedBuilding(buildingInfo);
                    setOriginalHeight(height);
                    setBuildingHeight(height);
                    highlightBuilding(newMap, buildingId);
                    onBuildingSelect(buildingId, height);
                }
            });

            newMap.on('mouseenter', '3d-buildings', () => {
                newMap.getCanvas().style.cursor = 'pointer';
            });

            newMap.on('mouseleave', '3d-buildings', () => {
                newMap.getCanvas().style.cursor = '';
                resetHighlight(newMap);
            });

            const hideMapboxLogo = () => {
                const logo = document.querySelector('.mapboxgl-ctrl-logo') as HTMLElement;
                if (logo) logo.style.display = 'none';

                const attribution = document.querySelector('.mapboxgl-ctrl-attrib') as HTMLElement;
                if (attribution) attribution.style.display = 'none';
            };

            hideMapboxLogo();
            newMap.on('style.load', hideMapboxLogo);
        });

        mapRef.current = newMap;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [onBuildingSelect]);

    const highlightBuilding = (map: mapboxgl.Map, buildingId: string) => {
        if (!map) return;

        map.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
            'case',
            ['==', ['get', 'id'], buildingId],
            '#ff0000', // Цвет выделенного здания
            '#aaa'
        ]);

        // Удаление существующего слоя обводки
        if (map.getLayer('building-outline')) {
            map.removeLayer('building-outline');
        }

        // Добавление обводки для выделенного здания
        map.addLayer({
            id: 'building-outline',
            type: 'line',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'id', buildingId],
            paint: {
                'line-color': '#000',
                'line-width': 2
            }
        });
    };

    const resetHighlight = (map: mapboxgl.Map) => {
        if (!map) return;

        map.setPaintProperty('3d-buildings', 'fill-extrusion-color', '#aaa');

        if (map.getLayer('building-outline')) {
            map.removeLayer('building-outline');
        }
    };

    const updateBuildingHeight = (newHeight: number) => {
        if (!mapRef.current || !selectedBuilding) return;

        const { id } = selectedBuilding;

        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-height', [
            'case',
            ['==', ['get', 'id'], id],
            newHeight,
            ['get', 'height']
        ]);
    };

    const handleIncreaseHeight = () => {
        if (selectedBuilding && buildingHeight !== null) {
            const newHeight = buildingHeight + 10;
            setBuildingHeight(newHeight);
            updateBuildingHeight(newHeight);
            onIncreaseHeight();
        }
    };

    const handleResetHeight = () => {
        if (selectedBuilding && originalHeight !== null) {
            setBuildingHeight(originalHeight);
            updateBuildingHeight(originalHeight);
            onResetHeight();
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full"></div>

            {selectedBuilding && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 z-10">
                    <h3 className="text-lg font-bold">Building Information</h3>
                    <p><strong>ID:</strong> {selectedBuilding.id}</p>
                    <p><strong>Height:</strong> {buildingHeight || selectedBuilding.height} meters</p>
                </div>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4 z-10">
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded" 
                    onClick={handleIncreaseHeight}
                >
                    Increase Height
                </button>
                <button 
                    className="bg-red-500 text-white px-4 py-2 rounded" 
                    onClick={handleResetHeight}
                >
                    Reset Height
                </button>
            </div>
        </div>
    );
};

export default Map;
