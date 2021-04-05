import { Dispatch } from "redux";
import { API_DATA_HOST } from "../constants";
import { reset, updateCars, updateFromStateMessage, updateManifests, updatePitstops } from "../stores/wamp/actions";

const processJsonFromArchive = (data: string, dispatch: Dispatch<any>) => {
  var lines = data.split("\n");
  let processed = 0;
  let lastTimestamp = 0;
  for (var line = 0; line < lines.length; line++) {
    if (lines[line].trim().length == 0) continue;
    // for (var line = 0; line < 5; line++) {
    // console.log(lines[line]);
    if (line % 100 === 0) {
      console.log(line);
    }
    const { payload, timestamp } = JSON.parse(lines[line]);

    const x = JSON.parse(lines[line]).payload;
    dispatch(updateFromStateMessage(x));

    const carsRowData = { data: JSON.parse(lines[line]).payload.cars };
    // console.log(rowData);
    dispatch(updateCars([carsRowData]));

    const pitsRowData = { data: JSON.parse(lines[line]).payload.pits };
    // console.log(rowData);
    dispatch(updatePitstops([pitsRowData]));
    // dispatch(updateCars(JSON.parse(lines[line]).data));
    processed++;
    lastTimestamp = timestamp;
  }
  console.log("processed " + processed + " entries till timestamp " + lastTimestamp);
  return { processed: processed, timestamp: lastTimestamp };
};

export const readData = (e: string, dispatch: Dispatch<any>, callback?: (msg: string) => void) => {
  const caller = (m: string) => {
    if (callback) callback(m);
  };
  const url = API_DATA_HOST + "/manifest-" + e + ".json";
  console.log(url);
  caller("load manifest");
  const x = fetch(API_DATA_HOST + "/manifest-" + e + ".json").then((res: Response) => {
    // const x = fetch("https://data.juelps.de/huhu.txt").then((res: Response) => {
    if (res.ok) {
      res.json().then((j) => dispatch(updateManifests(j)));
      // caller("load main data");
      fetch(API_DATA_HOST + "/data-" + e + ".json").then((res: Response) => {
        if (res.ok) {
          res.text().then((data) => {
            console.log(data.length);
            // caller("data loaded (" + data.length + " bytes)");
            dispatch(reset());
            // dispatch(uiReset());
            // caller("Processing....");
            const { processed, timestamp } = processJsonFromArchive(data, dispatch);
            caller("done");
          });
        }
      });
    }
  });
};
