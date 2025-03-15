import { createContext, useContext, useEffect, useState } from "react";

// Only import the types we need
interface BikeData {
  speed?: number;
  averageSpeed?: number;
  cadence?: number;
  averageCadence?: number;
  totalDistance?: number;
  resistanceLevel?: number;
  instantaneousPower?: number;
  averagePower?: number;
  totalEnergy?: number;
  energyPerHour?: number;
  energyPerMinute?: number;
  heartrate?: number;
  metabolicEquivalent?: number;
  time?: number;
  remainingTime?: number;
  raw?: string;
}

interface BikeContextType {
  data: BikeData | null;
  isConnected: boolean;
  error: Error | null;
}

const BikeContext = createContext<BikeContextType | null>(null);

export const useBike = () => {
  const context = useContext(BikeContext);
  if (!context) {
    throw new Error("useBike must be used within a BikeProvider");
  }
  return context;
};

export const BikeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<BikeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Listen for bike data events from the bike module
    const handleData = (event: MessageEvent) => {
      if (event.data.type === "bike-data") {
        setData(event.data.payload);
        setIsConnected(true);
        setError(null);
      } else if (event.data.type === "bike-error") {
        setError(new Error(event.data.payload));
        setIsConnected(false);
      } else if (event.data.type === "bike-disconnect") {
        setIsConnected(false);
      }
    };

    window.addEventListener("message", handleData);
    return () => window.removeEventListener("message", handleData);
  }, []);

  return (
    <BikeContext.Provider
      value={{
        data,
        isConnected,
        error,
      }}
    >
      {children}
    </BikeContext.Provider>
  );
};
