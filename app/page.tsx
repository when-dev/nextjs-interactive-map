'use client';

import dynamic from 'next/dynamic';
import React, { useState, useCallback } from 'react';
import { BuildingInfo as BuildingInfoType } from './types'; // Типы данных для здания
import UserAvatar from './components/UserAvatar';

const Map = dynamic(() => import('./components/Map'), { ssr: false });
const HeightControl = dynamic(() => import('./components/HeightControl'), { ssr: false });
const BuildingInfo = dynamic(() => import('./components/BuildingInfo'), { ssr: false });

const Home: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfoType | null>(null);
  const [buildingHeight, setBuildingHeight] = useState<number | null>(null);

  // Обработка выбора здания на карте
  const handleBuildingSelect = useCallback((buildingId: string, height: number) => {
    setSelectedBuilding({
      id: buildingId,
      height,
      name: 'Здание',
      address: 'Адрес',
    });
    setBuildingHeight(height);
  }, []);

  // Увеличение высоты здания
  const handleIncreaseHeight = useCallback(() => {
    if (buildingHeight !== null && selectedBuilding) {
      setBuildingHeight(buildingHeight + 10);
    }
  }, [buildingHeight, selectedBuilding]);

  // Сброс высоты здания
  const handleResetHeight = useCallback(() => {
    if (selectedBuilding) {
      setBuildingHeight(selectedBuilding.height);
    }
  }, [selectedBuilding]);

  return (
    <div className="relative w-full h-screen">
      <UserAvatar />
      <Map
        onBuildingSelect={handleBuildingSelect}
        selectedBuilding={selectedBuilding?.id || null}
        buildingHeight={buildingHeight}
      />
      <HeightControl
        onIncreaseHeight={handleIncreaseHeight}
        onResetHeight={handleResetHeight}
      />
      {selectedBuilding && (
        <BuildingInfo
          buildingId={selectedBuilding.id}
          height={buildingHeight}
          name={selectedBuilding.name || 'Неизвестное здание'}
          address={selectedBuilding.address || 'Неизвестный адрес'}
        />
      )}
    </div>
  );
};

export default Home;
