// app/page.tsx

"use client";

import dynamic from 'next/dynamic';
import React, { useState, useCallback } from 'react';
import UserAvatar from './components/UserAvatar';
import ActionMenu from './components/ActionMenu';
import { BuildingInfo } from './types';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

const Home: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [buildingHeight, setBuildingHeight] = useState<number | null>(null);

  const handleBuildingSelect = useCallback((buildingId: string, height: number) => {
    setSelectedBuilding(prev => ({
      id: buildingId,
      height,
      name: prev?.name || 'N/A',
      address: prev?.address || 'N/A'
    }));
    setBuildingHeight(height);
  }, []);

  const handleIncreaseHeight = useCallback(() => {
    if (buildingHeight !== null && selectedBuilding) {
      setBuildingHeight(buildingHeight + 10); // Увеличиваем высоту на 10 метров
    }
  }, [buildingHeight, selectedBuilding]);

  const handleResetHeight = useCallback(() => {
    if (selectedBuilding) {
      setBuildingHeight(selectedBuilding.height); // Сбрасываем высоту
    }
  }, [selectedBuilding]);

  return (
    <div className="relative w-full h-screen">
      <Map
        onBuildingSelect={handleBuildingSelect}
        onIncreaseHeight={handleIncreaseHeight}
        onResetHeight={handleResetHeight}
      />
      <UserAvatar />
      <ActionMenu
        selectedBuilding={selectedBuilding}
        onIncreaseHeight={handleIncreaseHeight}
        onResetHeight={handleResetHeight}
      />
    </div>
  );
};

export default Home;
