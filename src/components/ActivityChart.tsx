import { formatDuration } from "@/utils/time";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityPoint } from "../hooks/useActivity";
import { Text } from "./ui/text";
import { Box } from "styled-system/jsx";

interface ActivityChartProps {
  points: ActivityPoint[];
}

export function ActivityChart({ points }: ActivityChartProps) {
  const displayData = points.slice(-3600);

  if (displayData.length === 0) {
    return (
      <Box
        height={{ base: "220px", md: "300px" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text size="xl" style={{ color: "var(--color-text-muted)" }}>
          No data yet
        </Text>
      </Box>
    );
  }

  return (
    <Box
      width="100%"
      height={{ base: "220px", md: "300px" }}
      className="animate-fade-in-up animate-delay-2"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{
            top: 20,
            right: 5,
            left: -10,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-power)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--color-power)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-speed)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="var(--color-speed)" stopOpacity={0} />
            </linearGradient>
            <filter id="subtleGlow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--chart-grid)"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatDuration(value, "MM:SS")}
            minTickGap={100}
            stroke="var(--color-text-muted)"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="power"
            domain={[0, "auto"]}
            tickFormatter={(value) => `${value.toFixed(0)} W`}
            stroke="var(--color-text-muted)"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="speed"
            orientation="right"
            domain={[0, "auto"]}
            tickFormatter={(value) => `${value.toFixed(0)} km/h`}
            stroke="var(--color-text-muted)"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(value) => formatDuration(value)}
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            cursor={{ stroke: "var(--color-text-muted)", strokeOpacity: 0.3 }}
          />
          <Area
            yAxisId="speed"
            type="monotone"
            dataKey="speed"
            stroke="var(--color-speed)"
            fill="url(#speedGradient)"
            name="Speed (km/h)"
            isAnimationActive={false}
            strokeWidth={1.5}
            filter="url(#subtleGlow)"
          />
          <Area
            yAxisId="power"
            type="monotone"
            dataKey="power"
            stroke="var(--color-power)"
            fill="url(#powerGradient)"
            name="Power (W)"
            isAnimationActive={false}
            strokeWidth={1.5}
            filter="url(#subtleGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
