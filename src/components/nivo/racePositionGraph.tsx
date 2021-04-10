import { ResponsiveLine } from "@nivo/line";
import { Checkbox, Col, Empty, Row, Spin } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { uiRacePositionSettings } from "../../stores/ui/actions";
import { IRaceGraph } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";
import CarFilter from "../live/carFilter";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "../live/util";

interface IGraphData {
  x: number;
  y: number;
}

const RacePositionGraphNivo: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.racePositionSettings);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  if (wamp.raceGraph.length === 0) {
    return <Spin />;
  }
  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();
  const carClassesFromShowCars = _.uniq([
    uiSettings.showCars
      .map((carNum) => carInfoLookup.get(carNum)!.carClass)
      .filter((v) => "".localeCompare(v || "") === 0),
    "overall", // we need then allways
  ]).sort();
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
    const source: IRaceGraph[] = dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined && carEntry.pos > 0 && carEntry.lapNo > 0) {
        prev.push({ x: current.lapNo, y: uiSettings.showPosInClass ? carEntry.pic : carEntry.pos });
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const posData = carOrder.map((carNum) => ({ id: "#" + carNum, data: dataForCar(carNum) }));

  const onSelectShowCars = (value: any) => {
    dispatch(uiRacePositionSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(uiRacePositionSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const onCheckboxChange = () => {
    dispatch(uiRacePositionSettings({ ...uiSettings, showPosInClass: !uiSettings.showPosInClass }));
  };

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
          />
        </div>
      </Col>
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
            defaultChecked={uiSettings.showPosInClass}
            checked={uiSettings.showPosInClass}
            onChange={onCheckboxChange}
          >
            Show position in class
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

export default RacePositionGraphNivo;
