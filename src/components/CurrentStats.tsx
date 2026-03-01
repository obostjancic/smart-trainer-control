import { Stack } from "styled-system/jsx";
import { BikeData } from "../lib/bike/types";
import { Text } from "./ui/text";

interface CurrentStatsProps {
  data?: BikeData;
}

export function CurrentStats({ data }: CurrentStatsProps) {
  const speed = data?.speed ?? 0;

  return (
    <Stack gap={1} align="center" py={{ base: 4, md: 6 }} className="animate-fade-in-up">
      <Stack direction="row" gap={2} align="baseline" justify="center">
        <Text
          fontSize={{ base: "7xl", md: "8xl" }}
          fontWeight="bold"
          lineHeight="1"
          fontVariantNumeric="tabular-nums"
          style={{
            color: "var(--color-power)",
            textShadow: "var(--glow-power)",
            transition: "text-shadow 0.3s ease",
          }}
        >
          {data?.instantaneousPower || 0}
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          style={{ color: "var(--color-text-muted)" }}
        >
          W
        </Text>
      </Stack>
      <Stack direction="row" gap={2} align="baseline" justify="center">
        <Text
          fontSize={{ base: "4xl", md: "5xl" }}
          fontWeight="semibold"
          lineHeight="1"
          fontVariantNumeric="tabular-nums"
          style={{
            color: "var(--color-speed)",
            textShadow: "var(--glow-speed)",
            transition: "all 0.3s ease-out",
          }}
        >
          {speed.toFixed(1)}
        </Text>
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          style={{ color: "var(--color-text-muted)" }}
        >
          km/h
        </Text>
      </Stack>
    </Stack>
  );
}
