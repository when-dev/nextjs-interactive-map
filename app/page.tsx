'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BuildingInfo as BuildingInfoType } from './types';
import UserAvatar from './components/UserAvatar';

const Map = dynamic(() => import('./components/Map'), { ssr: false });
const SelectedBuildingsInfo = dynamic(() => import('./components/SelectedBuildingsInfo'), { ssr: false });

const Home: React.FC = () => {
  const [selectedBuildings, setSelectedBuildings] = useState<BuildingInfoType[]>([]);

  const handleBuildingSelect = useCallback((buildingId: string, height: number, address: string) => {
    setSelectedBuildings((prevBuildings) => {
      const alreadySelected = prevBuildings.some((building) => building.id === buildingId);
      if (alreadySelected) {
        return prevBuildings.filter((building) => building.id !== buildingId);
      } else {
        return [
          ...prevBuildings,
          {
            id: buildingId,
            height,
            name: 'Здание',
            address,
          },
        ];
      }
    });
  }, []);

  const handleRemoveBuilding = useCallback((buildingId: string) => {
    setSelectedBuildings((prevBuildings) => prevBuildings.filter((building) => building.id !== buildingId));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setSelectedBuildings([]);
  }, []);

  const handleIncreaseHeight = useCallback((buildingId: string) => {
    setSelectedBuildings((prevBuildings) =>
      prevBuildings.map((building) =>
        building.id === buildingId ? { ...building, height: building.height + 10 } : building
      )
    );
  }, []);

  const handleResetHeight = useCallback((buildingId: string) => {
    setSelectedBuildings((prevBuildings) =>
      prevBuildings.map((building) =>
        building.id === buildingId ? { ...building, height: building.height } : building
      )
    );
  }, []);

  return (
    <div className="relative w-full h-screen">
      <Map
        onBuildingSelect={handleBuildingSelect}
        selectedBuilding={null}
        buildingHeight={null}
        onClearBuildingSelection={handleRemoveBuilding}
        onClearAllSelections={handleRemoveAll}
      />
      <UserAvatar />
      <SelectedBuildingsInfo
        selectedBuildings={selectedBuildings}
        onRemoveBuilding={handleRemoveBuilding}
        onRemoveAll={handleRemoveAll}
        onIncreaseHeight={handleIncreaseHeight}
        onResetHeight={handleResetHeight}
      />
    </div>
  );
};

export default Home;
