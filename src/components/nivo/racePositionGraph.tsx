import { ResponsiveLine } from "@nivo/line";
import { Col, Empty, Row, Spin, theme } from "antd";
import React from "react";
import { useAppSelector } from "../../stores";

import { RaceGraph } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/racegraph_pb";
import { sortCarNumberStr } from "../../utils/output";

interface IGraphData {
  x: number;
  y: number;
}
interface MyProps {
  showCars: string[];
  showPosInClass: boolean;
}

const { useToken } = theme;

const RacePositionGraphNivo: React.FC<MyProps> = (props) => {
  // const wamp = useSelector((state: ApplicationState) => state.wamp.data);

  const raceGraph = useAppSelector((state) => state.raceGraph);
  const { token } = useToken();
  if (raceGraph.length === 0) {
    return <Spin />;
  }
  const carOrder = [...props.showCars].sort(sortCarNumberStr).reverse();

  const dataLookup = raceGraph.reduce((prev, cur) => {
    const entry = prev.get(cur.carClass);
    if (entry !== undefined) {
      prev.set(cur.carClass, entry.concat(cur));
    } else {
      prev.set(cur.carClass, [cur]);
    }
    return prev;
  }, new Map<string, RaceGraph[]>());

  const dataForCar = (carNum: string) => {
    const source: RaceGraph[] = dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined && carEntry.pos > 0 && carEntry.lapNo > 0) {
        prev.push({ x: current.lapNo, y: props.showPosInClass ? carEntry.pic : carEntry.pos });
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const posData = carOrder.map((carNum) => ({ id: "#" + carNum, data: dataForCar(carNum) }));

  const data = [
    { id: "#99", data: [1, 1, 2, 25].map((v, idx) => ({ x: idx + 1, y: v })) },
    { id: "#46", data: [7, 8, 1, 15].map((v, idx) => ({ x: idx + 1, y: v })) },
    { id: "#135", data: [1, 2, 3, 4, 5].map((v, idx) => ({ x: idx + 1, y: v })) },
  ];
  const InternalRaceGraph = (
    <Row gutter={16}>
      <Col span={22}>
        <div style={{ height: 500 }}>
          <ResponsiveLine
            data={posData}
            margin={{ top: 40, right: 65, bottom: 40, left: 60 }}
            colors={{ scheme: "category10" }}
            useMesh={true}
            animate={false}
            enableSlices="x"
            enablePoints={false}
            enableGridX={false}
            axisBottom={{
              tickValues: 10,
              tickSize: 5,
              tickPadding: 5,
            }}
            xScale={{
              type: "linear",
            }}
            legends={[
              {
                anchor: "top-right",
                direction: "column",
                justify: false,
                itemTextColor: token.colorTextLabel,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: token.colorTextLabel,
                  },
                  line: { stroke: token.colorTextLabel },
                },
              },
              tooltip: {
                container: {
                  background: token.colorBgBase,
                },
              },
            }}
          />
        </div>
      </Col>
    </Row>
  );

  return (
    <>
      {props.showCars.length === 0 ? (
        <Empty description="Select single cars or car classes from the above selectors" />
      ) : (
        InternalRaceGraph
      )}
    </>
  );
};

export default RacePositionGraphNivo;
