import { useEffect, useState } from "react";
import { Box, Stack } from "styled-system/jsx";
import { BikeData } from "../lib/bike/types";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardProps {
  isActive: boolean;
  onData: (data: BikeData) => void;
}

interface ChartPoint {
  timestamp: number;
  power: number;
  speed: number;
}

export function Dashboard({ isActive, onData }: DashboardProps) {
  const [currentData, setCurrentData] = useState<BikeData>({});
  const [historicalData, setHistoricalData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    function handleBikeData(event: MessageEvent) {
      if (event.data.type === "bike-data") {
        const data = event.data.payload as BikeData;

        // Always update current data
        setCurrentData(data);
        onData(data);

        // Only update historical data if activity is active
        if (isActive) {
          setHistoricalData((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              power: data.instantaneousPower || 0,
              speed: data.speed || 0,
            },
          ]);
        }
      }
    }

    window.addEventListener("message", handleBikeData);
    return () => window.removeEventListener("message", handleBikeData);
  }, [isActive, onData]);

  // Get the last hour of data for display
  const displayData = historicalData.slice(-3600);

  return (
    <Box>
      <Stack gap={4}>
        <Card.Root>
          <Card.Header>
            <Card.Title>Current Stats</Card.Title>
          </Card.Header>
          <Card.Body>
            <Stack direction="row" gap={16} justify="center">
              <Box>
                <Text size="2xl"> Power</Text>
                <Stack direction="row" gap={2} align="baseline">
                  <Text
                    size="7xl"
                    color="#b658c4"
                    minWidth="2em"
                    textAlign="right"
                  >
                    {currentData.instantaneousPower || 0}
                  </Text>
                  <Text size="2xl">W</Text>
                </Stack>
              </Box>
              <Box>
                <Text size="2xl"> Speed</Text>
                <Stack direction="row" gap={2} align="baseline">
                  <Text
                    size="7xl"
                    color="#46a758"
                    minWidth="2em"
                    textAlign="right"
                  >
                    {currentData.speed?.toFixed(1) || 0}
                  </Text>
                  <Text size="2xl">km/h</Text>
                </Stack>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>History</Card.Title>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString()
                  }
                />
                <YAxis yAxisId="power" domain={[0, "auto"]} />
                <YAxis
                  yAxisId="speed"
                  orientation="right"
                  domain={[0, "auto"]}
                />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleTimeString()
                  }
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="power"
                  stroke="#b658c4"
                  name="Power (W)"
                />
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="speed"
                  stroke="#46a758"
                  name="Speed (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
