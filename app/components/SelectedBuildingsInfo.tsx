import React from 'react';
import { BuildingInfo as BuildingInfoType } from '../types';

interface SelectedBuildingsInfoProps {
  selectedBuildings: BuildingInfoType[];
  onRemoveBuilding: (buildingId: string) => void;
  onIncreaseHeight: (buildingId: string) => void;
  onResetHeight: (buildingId: string) => void;
  onRemoveAll: () => void;
}

const SelectedBuildingsInfo: React.FC<SelectedBuildingsInfoProps> = ({
  selectedBuildings,
  onRemoveBuilding,
  onIncreaseHeight,
  onResetHeight,
  onRemoveAll,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-10 max-h-[80vh] overflow-y-auto">
      {selectedBuildings.length > 2 && (
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4 w-full"
          onClick={onRemoveAll}
        >
          Удалить все выбранные здания
        </button>
      )}
      {selectedBuildings.map((building) => (
        <div key={building.id} className="mb-4 border-b pb-4">
          <h3 className="font-bold">{building.name || 'Неизвестное здание'}</h3>
          <p>ID: {building.id}</p>
          <p>Высота: {building.height} м</p>
          <p>Адрес: {building.address || 'Неизвестный адрес'}</p>
          <div className="flex justify-between mt-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => onIncreaseHeight(building.id)}
            >
              Увеличить высоту
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => onResetHeight(building.id)}
            >
              Сбросить высоту
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => onRemoveBuilding(building.id)}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectedBuildingsInfo;
