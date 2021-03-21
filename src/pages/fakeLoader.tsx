import { Col, Row } from "antd";
import Search from "antd/lib/input/Search";
import autobahn, { Session } from "autobahn";
import React from "react";
import { useDispatch } from "react-redux";
import { sprintf } from "sprintf-js";
import { API_CROSSBAR_URL, API_CROSSBAR_URL_HTTP } from "../constants";
import {
  connectedToServer,
  reset,
  updateCars,
  updateFromStateMessage,
  updateManifests,
  updateMessages,
  updatePitstops,
  updateSession,
} from "../stores/wamp/actions";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const FakeLoaderPage: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();

  const processJsonFromArchive = (data: string) => {
    var lines = data.split("\n");
    let processed = 0;
    let lastTimestamp = 0;
    for (var line = 0; line < lines.length; line++) {
      if (lines[line].trim().length == 0) continue;
      // for (var line = 0; line < 5; line++) {
      // console.log(lines[line]);
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

  const readData = (e: string) => {
    const url = API_CROSSBAR_URL_HTTP + "/testdata/manifest-" + e + ".json";
    console.log(url);
    const x = fetch(API_CROSSBAR_URL_HTTP + "/testdata/manifest-" + e + ".json").then((res: Response) => {
      if (res.ok) {
        res.json().then((j) => dispatch(updateManifests(j)));
        fetch(API_CROSSBAR_URL_HTTP + "/testdata/data-" + e + ".json").then((res: Response) => {
          if (res.ok) {
            res.text().then((data) => {
              console.log(data.length);
              dispatch(reset());
              const { processed, timestamp } = processJsonFromArchive(data);
            });
          }
        });
      }
    });
  };

  const loadAndLive = (eventId: string) => {
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.archive.get_manifest", [eventId]).then((data: any) => {
        console.log(data);
        dispatch(updateManifests(JSON.parse(data)));

        s.call("racelog.archive.get_data", [eventId, 0]).then((data: any) => {
          console.log(data.length);
          dispatch(reset());
          const { processed, timestamp } = processJsonFromArchive(data);
          console.log("processed " + processed + ". now fetch data after " + timestamp);
          s.call("racelog.archive.get_data", [eventId, timestamp]).then((data: any) => {
            console.log(data.length);
            processJsonFromArchive(data);
            // now register live data

            s.subscribe(sprintf("racelog.state.%s", eventId), (data) => {
              dispatch(updateFromStateMessage(data[0].payload));
            });
            s.subscribe(sprintf("session.%s", eventId), (data) => {
              dispatch(updateSession(data));
            });
            s.subscribe(sprintf("messages.%s", eventId), (data) => {
              dispatch(updateMessages(data));
            });
            s.subscribe(sprintf("cars.%s", eventId), (data) => {
              dispatch(updateCars(data));
            });
            s.subscribe(sprintf("pits.%s", eventId), (data) => {
              dispatch(updatePitstops(data));
            });
          });
          dispatch(connectedToServer());
        });
      });
    };
    conn.open();
  };

  return (
    <>
      <Row>
        <Col span={4}>
          <Search placeholder="load from testdata dir" onSearch={readData} />
        </Col>
        <Col span={4}>
          <Search placeholder="Simulate load + live" onSearch={loadAndLive} />
        </Col>
      </Row>
      <Row>{/* <RaceGraph /> */}</Row>
    </>
  );
};
