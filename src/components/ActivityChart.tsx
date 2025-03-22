import { formatDuration } from "@/utils/time";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityPoint } from "../hooks/useActivity";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { Box } from "styled-system/jsx";

interface ActivityChartProps {
  points: ActivityPoint[];
}

export function ActivityChart({ points }: ActivityChartProps) {
  const displayData = points.slice(-3600);

  if (displayData.length === 0) {
    return (
      <Card.Root>
        <Card.Header>
          <Card.Title>Activity Chart</Card.Title>
        </Card.Header>
        <Card.Body>
          <Box
            height={300}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Text size="2xl">No data</Text>
          </Box>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Activity Chart</Card.Title>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={displayData}
            margin={{
              top: 5,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatDuration(value, "MM:SS")}
              minTickGap={100}
            />
            <YAxis
              yAxisId="power"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value.toFixed(0)} W`}
            />
            <YAxis
              yAxisId="speed"
              orientation="right"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value.toFixed(0)} km/h`}
            />
            <Tooltip labelFormatter={(value) => formatDuration(value)} />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="power"
              stroke="#b658c4"
              name="Power (W)"
              isAnimationActive={false}
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="speed"
              type="monotone"
              dataKey="speed"
              stroke="#46a758"
              name="Speed (km/h)"
              isAnimationActive={false}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
}
