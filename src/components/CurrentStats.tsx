import { useEffect, useState } from "react";
import { Stack } from "styled-system/jsx";
import { BikeData } from "../lib/bike/types";
import { Card } from "./ui/card";
import { Text } from "./ui/text";

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
        <Stack direction="row" gap={16} py={6} justify="center">
          <Stack direction="row" gap={2} align="baseline">
            <Text
              size="6xl"
              fontWeight="semibold"
              color="#b658c4"
              minWidth="1.5em"
              textAlign="right"
            >
              {data?.instantaneousPower || 0}
            </Text>
            <Text size="2xl">W</Text>
          </Stack>

          <Stack direction="row" gap={2} align="baseline">
            <Text
              size="6xl"
              fontWeight="semibold"
              color="#46a758"
              minWidth="1.5em"
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
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
