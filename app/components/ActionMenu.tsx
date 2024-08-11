import { Button } from "@/components/ui/button";

const ActionMenu = () => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex space-x-4">
    <Button variant="default" className="bg-blue-500 text-white">
      Increase Height
    </Button>
    <Button variant="default" className="bg-red-500 text-white">
      Reset Height
    </Button>
  </div>
);

export default ActionMenu;
