import { Checkbox, Col, Empty, Row, Spin } from "antd";
import { isNumber } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ApplicationState } from "../../stores";
import { uiRaceGraphSettings } from "../../stores/ui/actions";
import { IRaceGraph } from "../../stores/wamp/types";
import CarFilter from "../live/carFilter";
import { strokeColors } from "../live/colors";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "../live/util";

interface IGraphData {
  carNum: string;
  lapNo: number;
  gap: number;
}

const RaceGraphRecharts: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceGraphSettings);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  if (wamp.raceGraph.length === 0) {
    return <Spin />;
  }

  const dataLookup = wamp.raceGraph.reduce((prev, cur) => {
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

  let gaps = [] as any[];
  byLapLookup.forEach((v, lapNo) => {
    gaps.push(
      v.reduce(
        (cur, prev) => {
          return { ...prev, ...cur };
        },
        { lapNo: lapNo }
      )
    );
  });

  console.log(gaps);

  const graphData = [
    { carNum: "12", lapNo: 1, gap: 10 },
    { carNum: "20", lapNo: 1, gap: 20 },
    { carNum: "12", lapNo: 2, gap: 5 },
    { carNum: "20", lapNo: 2, gap: 30 },
  ];

  const graphData2 = [
    { lapNo: 1, car12: 10, car20: 20, "#45": 30 },
    { lapNo: 2, car12: 5, car20: 30, "#45": 40 },
    { lapNo: 3, car12: 7, car20: 40, "#45": 5 },
  ];

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const onSelectShowCars = (value: any) => {
    dispatch(uiRaceGraphSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(uiRaceGraphSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const onCheckboxChange = () => {
    dispatch(uiRaceGraphSettings({ ...uiSettings, gapRelativeToClassLeader: !uiSettings.gapRelativeToClassLeader }));
  };
  const test = 6;
  const InternalRaceGraph = (
    <Row gutter={16}>
      <Col span={22}>
        {/* <VictoryChart
          width={1500}
          height={750}
          standalone={true}
          theme={VictoryTheme.grayscale}          
          domainPadding={{ x: [10, 0] }}
          containerComponent={vvc}
        >
          
          {uiSettings.showCars.map((carNum, idx) => (
            <VictoryLine
              key={_.uniqueId()}
              data={dataForCar(carNum)}
              labels={(d: any) => ["Lap " + d.datum.x, "Gap " + lapTimeString(d.datum.y), d.datum.id]}
              style={{ data: { stroke: colorCode(carNum) } }}
              labelComponent={<VictoryTooltip />}
            />
          ))}
        </VictoryChart> */}

        <ResponsiveContainer width="100%" height={750}>
          <LineChart width={1500} height={750} data={gaps}>
            {uiSettings.showCars.map((carNum) => (
              <Line
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
            <YAxis />
            <Tooltip />
            <Legend layout="vertical" align="right" verticalAlign="top" />
          </LineChart>
        </ResponsiveContainer>
      </Col>
      {/* <Col>
        <List
          size="small"
          dataSource={uiSettings.showCars}
          renderItem={(item, idx) => <List.Item style={{ color: colorCode(item) }}>#{item}</List.Item>}
        />
      </Col> */}
    </Row>
  );

  return (
    <>
      <Row gutter={16}>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectShowCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
        <Col span={3}>
          <Checkbox
            defaultChecked={uiSettings.gapRelativeToClassLeader}
            checked={uiSettings.gapRelativeToClassLeader}
            onChange={onCheckboxChange}
          >
            Gaps relative to class leader
          </Checkbox>
        </Col>
      </Row>
      {uiSettings.showCars.length === 0 ? (
        <Empty description="Select single cars or car classes from the above selectors" />
      ) : (
        InternalRaceGraph
      )}
    </>
  );
};

export default RaceGraphRecharts;
