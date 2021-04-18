import { Dispatch } from "redux";
import { API_DATA_HOST } from "../constants";
import { reset, setData, updateCars, updateFromStateMessage, updatePitstops } from "../stores/wamp/actions";
import { bulkProcess } from "../stores/wamp/compute/bulkProcessing";
import { postProcessManifest } from "../stores/wamp/reducer";
import { defaultWampData, IManifests, IWampData } from "../stores/wamp/types";

export const processJsonFromArchive = (data: string, dispatch: Dispatch<any>) => {
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
    if (true) dispatch(updateFromStateMessage(x));

    const carsRowData = { data: JSON.parse(lines[line]).payload.cars };
    // console.log(rowData);
    if (false) dispatch(updateCars([carsRowData]));

    const pitsRowData = { data: JSON.parse(lines[line]).payload.pits };
    // console.log(rowData);
    if (true) dispatch(updatePitstops([pitsRowData]));
    // dispatch(updateCars(JSON.parse(lines[line]).data));
    processed++;
    lastTimestamp = timestamp;
  }
  console.log("processed " + processed + " entries till timestamp " + lastTimestamp);
  return { processed: processed, timestamp: lastTimestamp };
};

const processJsonFromArchiveInOneGo = (data: string, manifests: IManifests) => {
  const wamp = { ...defaultWampData, manifests: manifests };
  var lines = data.split("\n");
  let processed = 0;
  let lastTimestamp = 0;
  let collectJson = [];
  for (var line = 0; line < lines.length; line++) {
    if (lines[line].trim().length == 0) continue;
    // for (var line = 0; line < 5; line++) {
    // console.log(lines[line]);
    // if (line % 100 === 0) {
    //   console.log(line);
    // }
    const x = JSON.parse(lines[line]); //.payload;
    collectJson.push(x);
    processed++;
    lastTimestamp = x.timestamp;
  }
  // const carsData = collectJson.map((item) => item.cars);
  const ret = { ...wamp, ...bulkProcess(wamp, collectJson) };
  console.log("processed " + processed + " entries till timestamp " + lastTimestamp);
  return { processed: processed, timestamp: lastTimestamp, newStateData: ret };
};

export const readData = (e: string, dispatch: Dispatch<any>, callback?: (msg: string) => void) => {
  const caller = (m: string) => {
    if (callback) callback(m);
  };
  const url = API_DATA_HOST + "/manifest-" + e + ".json";
  console.log(url);
  caller("load manifest");
  const x = fetch(API_DATA_HOST + "/manifest-" + e + ".json").then((res: Response) => {
    if (res.ok) {
      var manis: IManifests;
      res.json().then((j) => (manis = postProcessManifest(j[0])));
      caller("load main data");
      fetch(API_DATA_HOST + "/data-" + e + ".json").then((res: Response) => {
        if (res.ok) {
          res.text().then((data) => {
            console.log(data.length);
            caller("data loaded (" + data.length + " bytes)");
            dispatch(reset());
            // dispatch(uiReset());
            caller("Processing....");
            const { processed, timestamp, newStateData } = processJsonFromArchiveInOneGo(data, manis);
            dispatch(setData(newStateData));
            caller("done");
          });
        }
      });
    }
  });
};

export const readAndProcessData = (
  e: string,
  dispatch: Dispatch<any>,
  callback?: (msg: string) => Promise<{ processed: number; timestamp: number; newStateData: IWampData }>
) => {
  const caller = (m: string) => {
    if (callback) callback(m);
  };
  const url = API_DATA_HOST + "/manifest-" + e + ".json";
  console.log(url);
  caller("load manifest");
  return new Promise((resolve, reject) => {
    const x = fetch(API_DATA_HOST + "/manifest-" + e + ".json").then((res: Response) => {
      if (res.ok) {
        var manis: IManifests;
        res.json().then((j) => (manis = postProcessManifest(j[0])));
        caller("load main data");
        fetch(API_DATA_HOST + "/data-" + e + ".json").then((res: Response) => {
          if (res.ok) {
            res.text().then((data) => {
              console.log(data.length);
              caller("data loaded (" + data.length + " bytes)");
              dispatch(reset());
              // dispatch(uiReset());
              caller("Processing....");
              resolve(processJsonFromArchiveInOneGo(data, manis));
            });
          }
        });
      }
    });
  });
};
