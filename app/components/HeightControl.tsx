import React from 'react';

interface HeightControlProps {
  onIncreaseHeight: () => void;
  onResetHeight: () => void;
}

const HeightControl: React.FC<HeightControlProps> = ({ onIncreaseHeight, onResetHeight }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-10">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onIncreaseHeight}
      >
        Увеличить высоту
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
        onClick={onResetHeight}
      >
        Сбросить высоту
      </button>
    </div>
  );
};

export default HeightControl;
