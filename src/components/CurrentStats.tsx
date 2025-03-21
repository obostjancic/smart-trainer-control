import { Box, Stack } from "styled-system/jsx";
import { BikeData } from "../lib/bike/types";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { useEffect, useState } from "react";

interface CurrentStatsProps {
  data?: BikeData;
}

export function CurrentStats({ data }: CurrentStatsProps) {
  const [displaySpeed, setDisplaySpeed] = useState(0);

  useEffect(() => {
    if (data?.speed !== undefined) {
      setDisplaySpeed(data.speed);
    }
  }, [data?.speed]);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Instantaneous</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack direction="row" gap={16} justify="center">
          <Box>
            <Text size="2xl"> Power</Text>
            <Stack direction="row" gap={2} align="baseline">
              <Text
                size="7xl"
                fontWeight="semibold"
                color="#b658c4"
                minWidth="2em"
                textAlign="right"
              >
                {data?.instantaneousPower || 0}
              </Text>
              <Text size="2xl">W</Text>
            </Stack>
          </Box>
          <Box>
            <Text size="2xl"> Speed</Text>
            <Stack direction="row" gap={2} align="baseline">
              <Text
                size="7xl"
                fontWeight="semibold"
                color="#46a758"
                minWidth="2em"
                textAlign="right"
                style={{
                  transition: "all 0.3s ease-out",
                  display: "inline-block",
                }}
              >
                {displaySpeed.toFixed(1)}
              </Text>
              <Text size="2xl">km/h</Text>
            </Stack>
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
