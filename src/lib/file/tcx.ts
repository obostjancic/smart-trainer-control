import {
  ActivityFileFormat,
  ActivityPoint,
  aggregateActivityPoints,
} from "./common";

export const tcxFormat: ActivityFileFormat = {
  async parse(content: string | ArrayBuffer): Promise<ActivityPoint[]> {
    const tcxContent =
      typeof content === "string" ? content : new TextDecoder().decode(content);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxContent, "text/xml");
    const trackpoints = xmlDoc.getElementsByTagName("Trackpoint");

    const points: ActivityPoint[] = Array.from(trackpoints).map(
      (trackpoint) => {
        const timeElement = trackpoint.getElementsByTagName("Time")[0];
        const heartRateElement =
          trackpoint.getElementsByTagName("HeartRateBpm")[0];
        const extensionsElement =
          trackpoint.getElementsByTagName("Extensions")[0];
        const tpxElement =
          extensionsElement?.getElementsByTagName("ns3:TPX")[0];
        const speedElement = tpxElement?.getElementsByTagName("ns3:Speed")[0];
        const wattsElement = tpxElement?.getElementsByTagName("ns3:Watts")[0];
        const heartRateValue =
          heartRateElement?.getElementsByTagName("Value")[0]?.textContent;

        return {
          timestamp: timeElement
            ? parseTimeFromTCX(timeElement.textContent!)
            : 0,
          heartRate: heartRateValue ? parseInt(heartRateValue) : undefined,
          power: wattsElement?.textContent
            ? parseInt(wattsElement.textContent)
            : undefined,
          speed: speedElement?.textContent
            ? parseFloat(speedElement.textContent)
            : undefined,
        };
      }
    );

    return points;
  },

  async merge(
    existingContent: string | ArrayBuffer,
    activityPoints: ActivityPoint[]
  ): Promise<string | ArrayBuffer> {
    const existingTCX =
      typeof existingContent === "string"
        ? existingContent
        : new TextDecoder().decode(existingContent);
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

      if (!activityPoint) {
        return;
      }

      if (activityPoint.speed !== undefined) {
        let extensionsElement =
          trackpoint.getElementsByTagName("Extensions")[0];
        if (!extensionsElement) {
          extensionsElement = xmlDoc.createElement("Extensions");
          trackpoint.appendChild(extensionsElement);
        }

        let tpxElement = extensionsElement.getElementsByTagName("ns3:TPX")[0];
        if (!tpxElement) {
          tpxElement = xmlDoc.createElementNS(
            "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            "TPX"
          );
          extensionsElement.appendChild(tpxElement);
        }

        let speedElement = tpxElement.getElementsByTagName("ns3:Speed")[0];
        if (!speedElement) {
          speedElement = xmlDoc.createElementNS(
            "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            "Speed"
          );
          tpxElement.appendChild(speedElement);
        }
        speedElement.textContent = (activityPoint.speed / 3.6).toFixed(2);
      }

      if (activityPoint.power !== undefined) {
        let extensionsElement =
          trackpoint.getElementsByTagName("Extensions")[0];
        if (!extensionsElement) {
          extensionsElement = xmlDoc.createElement("Extensions");
          trackpoint.appendChild(extensionsElement);
        }

        let tpxElement = extensionsElement.getElementsByTagName("ns3:TPX")[0];
        if (!tpxElement) {
          tpxElement = xmlDoc.createElementNS(
            "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            "TPX"
          );
          extensionsElement.appendChild(tpxElement);
        }

        let wattsElement = tpxElement.getElementsByTagName("ns3:Watts")[0];
        if (!wattsElement) {
          wattsElement = xmlDoc.createElementNS(
            "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            "Watts"
          );
          tpxElement.appendChild(wattsElement);
        }
        wattsElement.textContent = activityPoint.power.toFixed(0);
      }
    });

    return new XMLSerializer().serializeToString(xmlDoc);
  },
};

function parseTimeFromTCX(timeString: string): number {
  return new Date(timeString).getTime();
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
