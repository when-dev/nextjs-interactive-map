import React from 'react';

interface BuildingInfoProps {
  buildingId: string;
  height: number | null;
  name: string;
  address: string;
}

const BuildingInfo: React.FC<BuildingInfoProps> = ({ buildingId, height, name, address }) => {
  return (
    <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-10">
      <h2 className="text-xl font-bold">{name}</h2>
      <p>ID: {buildingId}</p>
      <p>Высота: {height} м</p>
      <p>Адрес: {address}</p>
    </div>
  );
};

export default BuildingInfo;
