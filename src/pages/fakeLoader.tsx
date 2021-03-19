import { Col, Row } from "antd";
import Search from "antd/lib/input/Search";
import React from "react";
import { useDispatch } from "react-redux";
import { API_CROSSBAR_URL_HTTP } from "../constants";
import { reset, updateCars, updateFromStateMessage, updateManifests, updatePitstops } from "../stores/wamp/actions";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const FakeLoaderPage: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();
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
              var lines = data.split("\n");
              for (var line = 0; line < lines.length; line++) {
                // for (var line = 0; line < 5; line++) {
                // console.log(lines[line]);

                const x = JSON.parse(lines[line]).payload;
                dispatch(updateFromStateMessage(x));

                const carsRowData = { data: JSON.parse(lines[line]).payload.cars };
                // console.log(rowData);
                dispatch(updateCars([carsRowData]));

                const pitsRowData = { data: JSON.parse(lines[line]).payload.pits };
                // console.log(rowData);
                dispatch(updatePitstops([pitsRowData]));
                // dispatch(updateCars(JSON.parse(lines[line]).data));
              }
              console.log(line);
            });
          }
        });
      }
    });
  };

  return (
    <>
      <Row>
        <Col span={4}>
          <Search placeholder="" onSearch={readData} />
        </Col>
      </Row>
      <Row>{/* <RaceGraph /> */}</Row>
    </>
  );
};
