// app/components/ActionMenu.tsx

import { Button } from "@/components/ui/button";
import { BuildingInfo } from '../types'; 

interface ActionMenuProps {
  selectedBuilding: BuildingInfo | null;
  onIncreaseHeight: () => void;
  onResetHeight: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ selectedBuilding, onIncreaseHeight, onResetHeight }) => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex space-x-4">
    <Button
      variant="default"
      className="bg-blue-500 text-white"
      onClick={onIncreaseHeight}
      disabled={!selectedBuilding}
    >
      Increase Height
    </Button>
    <Button
      variant="default"
      className="bg-red-500 text-white"
      onClick={onResetHeight}
      disabled={!selectedBuilding}
    >
      Reset Height
    </Button>
  </div>
);

export default ActionMenu;
