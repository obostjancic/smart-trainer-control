interface ActivityPoint {
  timestamp: number;
  power?: number;
  speed?: number;
}

interface ParsedTrackpoint {
  timestamp: number;
  heartRate?: number;
  power?: number;
  speed?: number;
}

function parseTimeFromTCX(timeStr: string): number {
  return new Date(timeStr).getTime();
}

export function parseTCX(tcxContent: string): ParsedTrackpoint[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(tcxContent, "text/xml");
  const trackpoints = xmlDoc.getElementsByTagName("Trackpoint");

  return Array.from(trackpoints).map((trackpoint) => {
    const timeElement = trackpoint.getElementsByTagName("Time")[0];
    if (!timeElement || !timeElement.textContent) {
      throw new Error("Invalid TCX format: Trackpoint missing Time element");
    }

    const heartRateElement = trackpoint
      .getElementsByTagName("HeartRateBpm")[0]
      ?.getElementsByTagName("Value")[0];
    const powerElement = trackpoint.getElementsByTagName("ns3:Watts")[0];
    const speedElement = trackpoint.getElementsByTagName("Speed")[0];

    return {
      timestamp: parseTimeFromTCX(timeElement.textContent),
      heartRate: heartRateElement
        ? Number(heartRateElement.textContent)
        : undefined,
      power: powerElement ? Number(powerElement.textContent) : undefined,
      speed: speedElement ? Number(speedElement.textContent) : undefined,
    };
  });
}

export function mergeTCXData(
  existingTCX: string,
  activityPoints: ActivityPoint[]
): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(existingTCX, "text/xml");

  // Ensure we have the required namespace
  const root = xmlDoc.documentElement;
  if (!root.hasAttribute("xmlns:ns3")) {
    root.setAttribute(
      "xmlns:ns3",
      "http://www.garmin.com/xmlschemas/ActivityExtension/v2"
    );
  }

  const trackpoints = xmlDoc.getElementsByTagName("Trackpoint");
  const aggregatedActivityPoints = aggregateActivityPoints(activityPoints);

  const activityPointsMap = new Map(
    aggregatedActivityPoints.map((point) => [point.timestamp, point])
  );

  Array.from(trackpoints).forEach((trackpoint) => {
    const timeElement = trackpoint.getElementsByTagName("Time")[0];
    if (!timeElement || !timeElement.textContent) {
      console.log("Skipping no time element");
      return; // Skip this trackpoint if it has no time element
    }

    const timestamp = parseTimeFromTCX(timeElement.textContent);

    // [0] would give us the timestamp, [1] gives us the actual ActivityPoint data
    const activityPoint = Array.from(activityPointsMap.entries()).find(
      ([pointTimestamp]) => Math.abs(pointTimestamp - timestamp) <= 100
    )?.[1];

    if (activityPoint) {
      if (activityPoint.speed !== undefined) {
        let extensionsElement =
          trackpoint.getElementsByTagName("Extensions")[0];
        if (!extensionsElement) {
          extensionsElement = xmlDoc.createElement("Extensions");
          extensionsElement.removeAttribute("xmlns");
          trackpoint.appendChild(extensionsElement);
        }

        let tpxElement = extensionsElement.getElementsByTagName("ns3:TPX")[0];
        if (!tpxElement) {
          tpxElement = xmlDoc.createElement("ns3:TPX");
          tpxElement.removeAttribute("xmlns");
          extensionsElement.appendChild(tpxElement);
        }

        let speedElement = tpxElement.getElementsByTagName("ns3:Speed")[0];
        if (!speedElement) {
          speedElement = xmlDoc.createElement("ns3:Speed");
          speedElement.removeAttribute("xmlns");
          tpxElement.appendChild(speedElement);
        }
        speedElement.textContent = (activityPoint.speed / 3.6).toFixed(2);
      }

      if (activityPoint.power !== undefined) {
        let extensionsElement =
          trackpoint.getElementsByTagName("Extensions")[0];
        if (!extensionsElement) {
          extensionsElement = xmlDoc.createElement("Extensions");
          extensionsElement.removeAttribute("xmlns");
          trackpoint.appendChild(extensionsElement);
        }

        let tpxElement = extensionsElement.getElementsByTagName("ns3:TPX")[0];
        if (!tpxElement) {
          tpxElement = xmlDoc.createElement("ns3:TPX");
          tpxElement.removeAttribute("xmlns");
          extensionsElement.appendChild(tpxElement);
        }

        let wattsElement = tpxElement.getElementsByTagName("ns3:Watts")[0];
        if (!wattsElement) {
          wattsElement = xmlDoc.createElement("ns3:Watts");
          wattsElement.removeAttribute("xmlns");
          tpxElement.appendChild(wattsElement);
        }
        wattsElement.textContent = activityPoint.power.toFixed(0);
      }
    }
  });

  return new XMLSerializer().serializeToString(xmlDoc);
}

function aggregateActivityPoints(
  activityPoints: ActivityPoint[]
): (ActivityPoint & { count: number })[] {
  const pointsBySecond = new Map<number, ActivityPoint & { count: number }>();

  activityPoints.forEach((point) => {
    // Round timestamp to nearest second
    const secondTimestamp = Math.floor(point.timestamp / 1000) * 1000;

    if (!pointsBySecond.has(secondTimestamp)) {
      pointsBySecond.set(secondTimestamp, {
        timestamp: secondTimestamp,
        speed: point.speed,
        power: point.power,
        count: 1,
      });
    } else {
      const existing = pointsBySecond.get(secondTimestamp)!;
      pointsBySecond.set(secondTimestamp, {
        timestamp: secondTimestamp,
        speed:
          existing.speed !== undefined && point.speed !== undefined
            ? (existing.speed * existing.count + point.speed) /
              (existing.count + 1)
            : (existing.speed ?? point.speed),
        power:
          existing.power !== undefined && point.power !== undefined
            ? (existing.power * existing.count + point.power) /
              (existing.count + 1)
            : (existing.power ?? point.power),
        count: existing.count + 1,
      });
    }
  });

  // Convert back to array and sort by timestamp
  return Array.from(pointsBySecond.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
}

export function generateTCX(activityPoints: ActivityPoint[]): string {
  const averagedPoints = aggregateActivityPoints(activityPoints);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString();
  };

  const startTime = averagedPoints[0]?.timestamp ?? new Date().getTime();

  const trackpoints = averagedPoints
    .map(
      (point) => `
      <Trackpoint>
        <Time>${formatDate(point.timestamp)}</Time>
        ${point.speed !== undefined ? `<Speed>${point.speed}</Speed>` : ""}
        ${
          point.power !== undefined
            ? `<Extensions>
              <ns3:TPX>
                <ns3:Watts>${point.power}</ns3:Watts>
              </ns3:TPX>
            </Extensions>`
            : ""
        }
      </Trackpoint>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2"
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"
  xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1"
  xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Activities>
    <Activity Sport="Biking">
      <Id>${formatDate(startTime)}</Id>
      <Lap StartTime="${formatDate(startTime)}">
        <Track>
          ${trackpoints}
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
}
