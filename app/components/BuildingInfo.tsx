import React from 'react';

interface BuildingInfoProps {
  buildingId: string;
  height: number | null;
}

const BuildingInfo: React.FC<BuildingInfoProps> = ({ buildingId, height }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 z-10">
      <h2 className="text-lg font-bold">Информация о здании</h2>
      <p className="text-gray-600">ID здания: {buildingId}</p>
      <p className="text-gray-600">Высота здания: {height !== null ? `${height} м` : 'Неизвестно'}</p>
    </div>
  );
};

export default BuildingInfo;