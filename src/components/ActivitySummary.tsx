import { Activity } from "@/contexts/ActivityContext";
import { ActivityPoint } from "@/hooks/useActivity";
import { avg, max } from "@/utils/math";
import { downloadTCX, mergeTCX } from "@/utils/file";
import { generateTCX } from "@/lib/file/tcx";
import { formatDuration } from "@/utils/time";
import { ActivityChart } from "./ActivityChart";
import { Text } from "./ui/text";
import { DownloadIcon, UploadIcon, CheckCircle } from "lucide-react";
import { Box, Stack, Grid } from "styled-system/jsx";
import { css } from "styled-system/css";
import { SportButton } from "./SportButton";

interface ActivitySummaryProps {
  activity: Activity;
  chartPoints: ActivityPoint[];
  onReset: () => void;
}

const statCardStyle = css({
  background: "var(--color-btn-bg)",
  border: "1px solid var(--color-border)",
});

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <Stack gap={1} align="center" p={4} rounded="lg" className={statCardStyle}>
      <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </Text>
      <Stack direction="row" align="baseline" gap={1}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          fontVariantNumeric="tabular-nums"
          style={color ? { color } : undefined}
        >
          {value}
        </Text>
        <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
          {unit}
        </Text>
      </Stack>
    </Stack>
  );
}

export function ActivitySummary({
  activity,
  chartPoints,
  onReset,
}: ActivitySummaryProps) {
  const powers = activity.points
    .map((p) => p.power)
    .filter((p): p is number => p !== undefined);
  const speeds = activity.points
    .map((p) => p.speed)
    .filter((s): s is number => s !== undefined);

  const avgPower = Math.round(avg(powers));
  const maxPower = Math.round(max(powers));
  const avgSpeed = avg(speeds);
  const maxSpeed = max(speeds);

  const handleDownload = () => {
    const tcx = generateTCX(activity.points);
    downloadTCX(tcx, "bike-activity");
  };

  const handleMerge = () => {
    mergeTCX(activity.points);
  };

  return (
    <Box
      maxWidth="800px"
      mx="auto"
      minHeight="100dvh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      py={6}
      className="animate-fade-in-up"
    >
      <Stack gap={6}>
        {/* Header */}
        <Stack gap={1} align="center">
          <CheckCircle size={32} style={{ color: "var(--color-power)" }} />
          <Text fontSize="2xl" fontWeight="bold">
            Activity Complete
          </Text>
          <Text
            fontSize="4xl"
            fontWeight="bold"
            fontVariantNumeric="tabular-nums"
          >
            {formatDuration(activity.duration)}
          </Text>
        </Stack>

        {/* Stats Grid */}
        <Grid columns={{ base: 2, md: 4 }} gap={3}>
          <StatCard
            label="Avg Power"
            value={`${avgPower}`}
            unit="W"
            color="var(--color-power)"
          />
          <StatCard
            label="Max Power"
            value={`${maxPower}`}
            unit="W"
            color="var(--color-power)"
          />
          <StatCard
            label="Avg Speed"
            value={avgSpeed.toFixed(1)}
            unit="km/h"
            color="var(--color-speed)"
          />
          <StatCard
            label="Max Speed"
            value={maxSpeed.toFixed(1)}
            unit="km/h"
            color="var(--color-speed)"
          />
        </Grid>

        {/* Chart */}
        <Box>
          <ActivityChart points={chartPoints} />
        </Box>

        {/* Actions */}
        <Stack gap={3} direction={{ base: "column", md: "row" }}>
          <SportButton
            variant="primary"
            onClick={handleDownload}
            style={{ flex: 1, height: 56, fontSize: 16 }}
          >
            <DownloadIcon size={18} />
            Download TCX
          </SportButton>
          <SportButton
            variant="secondary"
            onClick={handleMerge}
            style={{ flex: 1, height: 56, fontSize: 16 }}
          >
            <UploadIcon size={18} />
            Merge with Existing
          </SportButton>
        </Stack>

        <SportButton
          variant="ghost"
          onClick={onReset}
          style={{ width: "100%", height: 48, fontSize: 15 }}
        >
          Done
        </SportButton>
      </Stack>
    </Box>
  );
}
