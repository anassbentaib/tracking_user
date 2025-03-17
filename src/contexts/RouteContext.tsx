import { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface RoutesContextType {
  routes: any[];
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRoute: (value: number | null) => void;
  selectedRoute: number | null;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

export const RoutesProvider = ({ children }: { children: ReactNode }) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  return (
    <RoutesContext.Provider
      value={{ routes, setRoutes, setSelectedRoute, selectedRoute }}
    >
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error("useRoutes must be used within a RoutesProvider");
  }
  return context;
};
