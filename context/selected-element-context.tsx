import { createContext } from "react";

interface SelectedElementContextProps {
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
}

export const SelectedElementContext =
  createContext<SelectedElementContextProps>({
    selectedElement: null,
    setSelectedElement: () => {},
  });
