## Manifest templates

```javascript
/**
 * variable data during sesssion
 */
export const SessionManifest: IDataEntrySpec[] = [
  { name: "sessionTime", type: "duration", info: "Current session time" },
  { name: "timeRemain", type: "duration", info: "Session time remaining" },
  { name: "lapsRemain", type: "numeric", info: "Remaining laps in race" },
  { name: "flagState", type: "text", info: "" },
  { name: "timeOfDay", type: "duration", info: "Current time in race" },
  { name: "airTemp", type: "numeric", info: "Air temperature" },
  { name: "airDensity", type: "numeric", info: "Air density" },
  { name: "airPressure", type: "numeric", info: "Air pressure" },
  { name: "trackTemp", type: "numeric", info: "Track temperature" },
  { name: "windDir", type: "numeric", info: "Wind direction" },
  { name: "windVel", type: "numeric", info: "Wind velocity" },
];

export const InfoMsgManifest: IDataEntrySpec[] = [
  { name: "type", type: "string", info: "Describes source of message" },
  { name: "subType", type: "string", info: "Additional type for message" },
  { name: "carIdx", type: "numeric", info: "iRacing carIdx" },
  { name: "carNum", type: "string", info: "car number" },
  { name: "carClass", type: "string", info: "car class" },
  { name: "msg", type: "string", info: "The message" },
];

export const CarManifest: IDataEntrySpec[] = [
  { name: "state", type: "string", info: "General info about the car (running,pit,...)" },
  { name: "carIdx", type: "numeric", info: "iRacing carIdx" },
  { name: "carNum", type: "string", info: "car number" },
  { name: "userName", type: "string", info: "current driver" },
  { name: "teamName", type: "string", info: "team name (if available)" },
  { name: "carClass", type: "string", info: "car class" },
  { name: "pos", type: "numeric", info: "overall position" },
  { name: "pic", type: "numeric", info: "position in class" },
  { name: "lap", type: "numeric", info: "current lap" },
  { name: "lc", type: "numeric", info: "laps completed" },
  { name: "gap", type: "numeric", info: "gap to leader" },
  { name: "interval", type: "numeric", info: "interval to car in front" },
  { name: "trackPos", type: "numeric", info: "position on track (percent)" },
  { name: "speed", type: "numeric", info: "current speed" },
  { name: "dist", type: "numeric", info: "distance to car in front (m)" },
  { name: "pit", type: "numeric", info: "# pitstops" },
  { name: "last", type: "numeric", info: "last lap time" },
  { name: "best", type: "numeric", info: "best lap time" },
];
```
