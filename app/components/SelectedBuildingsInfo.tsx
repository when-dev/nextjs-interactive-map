import React, { useState, useRef, useEffect } from 'react';
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(20); // in vh, starting at 50vh
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(panelHeight);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startHeight.current = panelHeight;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newHeight = Math.max(20, Math.min(60, startHeight.current + ((startY.current - clientY) * 100) / window.innerHeight));

    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={panelRef}
      style={{ height: `${panelHeight}vh` }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-10 transition-height duration-300 ease-in-out"
    >
      <div
        className="cursor-grab active:cursor-grabbing p-2 bg-gray-300 rounded-t-lg"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="w-12 h-1 bg-gray-500 mx-auto rounded"></div>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100%-50px)]">
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
    </div>
  );
};

export default SelectedBuildingsInfo;
