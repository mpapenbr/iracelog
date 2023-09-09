import { IRaceGraph } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Empty, Row, Spin } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";

import { cat10Colors } from "../live/colors";
import { extractSomeCarData } from "../live/util";

interface IGraphData {
  carNum: string;
  lapNo: number;
  gap: number;
}

const RaceGraphRecharts: React.FC<{}> = () => {
  //const wamp = useSelector((state: ApplicationState) => state.wamp.data);

  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraph);
  const raceGraph = useSelector((state: ApplicationState) => state.raceData.raceGraph);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.carInfo);

  const dispatch = useDispatch();
  // this little trick handles the fetching of brushInterval from state, let it be changed here and on leaving this Element store the values in the redux state.

  const carDataContainer = extractSomeCarData(carInfos);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  // const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  if (raceGraph.length === 0) {
    return <Spin />;
  }

  const dataLookup = raceGraph.reduce((prev, cur) => {
    let entry = prev.get(cur.carClass);
    if (entry !== undefined) {
      prev.set(cur.carClass, entry.concat(cur));
    } else {
      prev.set(cur.carClass, [cur]);
    }
    return prev;
  }, new Map<string, IRaceGraph[]>());

  const dataForCar = (carNum: string) => {
    const source: IRaceGraph[] =
      uiSettings.gapRelativeToClassLeader && allCarClasses.length > 0
        ? dataLookup.get(carInfoLookup.get(carNum)!.carClass)!
        : dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          // prev.push({ lapNo: current.lapNo, ["#" + carNum]: carEntry.gap });
          prev.push({ lapNo: current.lapNo, carNum: carNum, gap: carEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };
  const graphDataOrig = uiSettings.showCars.map((carNum) => dataForCar(carNum));
  interface MyData {
    [x: string]: number;
  }
  let byLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [{ ["#" + gd.carNum]: gd.gap }]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat({ ["#" + gd.carNum]: gd.gap }));
      }
    });
    return prev;
  }, new Map<number, MyData[]>());

  let graphDataByLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [gd]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat(gd));
      }
    });
    return prev;
  }, new Map<number, IGraphData[]>());
  graphDataByLapLookup.forEach((v) => v.sort((a, b) => a.gap - b.gap));

  let gaps = [] as any[];
  byLapLookup.forEach((v, lapNo) => {
    gaps.push(
      v.reduce(
        (cur, prev) => {
          return { ...prev, ...cur };
        },
        { lapNo: lapNo },
      ),
    );
  });

  const colorCode = (carNum: string): string => {
    const colors = cat10Colors;
    return colors[allCarNums.indexOf(carNum) % colors.length];
  };

  const CustomTooltip = (x: any) => {
    // console.log(x.label);
    if (x.label === undefined) return <></>;
    const data = graphDataByLapLookup.get(x.label);
    if (data !== undefined) {
      return (
        <div
          className="custom-tooltip"
          style={{
            margin: 0,
            padding: 10,
            backgroundColor: "white",
            border: "1px solid rgb(204,204,204)",
          }}
        >
          <p className="custom-tooltip">Lap {x.label}</p>
          <table cellPadding={1}>
            <tbody>
              {data.map((v) => (
                // <p className="custom-tooltip" style={{ color: colorCode(v.carNum) }}>
                <tr key={_.uniqueId()} style={{ color: colorCode(v.carNum) }}>
                  <td align="right">#{v.carNum}</td>
                  <td align="right">{sprintf("%.02f", v.gap)}</td>
                </tr>
                // </p>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else return <p>No data for lap {x.label}</p>;
  };
  const InternalRaceGraph = (
    <Row gutter={16}>
      <Col span={22}>
        <ResponsiveContainer width="100%" height={750}>
          <LineChart width={1500} height={750} data={gaps}>
            {uiSettings.showCars.map((carNum) => (
              <Line
                key={_.uniqueId()}
                type="monotone"
                isAnimationActive={false}
                dot={false}
                stroke={colorCode(carNum)}
                name={`#${carNum}`}
                dataKey={(d) => {
                  return d["#" + carNum];
                }}
              />
            ))}

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lapNo" />
            <YAxis
              type="number"
              allowDataOverflow={true}
              tickCount={10}
              allowDecimals={false}
              domain={[0, uiSettings.deltaRange]}
            />
            {globalWamp.currentLiveId ? (
              <></>
            ) : (
              <Brush dataKey="lapNo" height={30} stroke="#8884d8" />
            )}
            <Tooltip isAnimationActive={false} content={CustomTooltip} />
            <Legend layout="vertical" align="right" verticalAlign="top" />
          </LineChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );

  return (
    <>
      {uiSettings.showCars.length === 0 ? (
        <Empty description="Select single cars or car classes from the above selectors" />
      ) : (
        InternalRaceGraph
      )}
    </>
  );
};

export default RaceGraphRecharts;
