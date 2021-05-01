import { ResponsiveBar } from "@nivo/bar";
import { Col, Empty, Radio, RadioChangeEvent, Row, Select, Tag } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { stintsSettings } from "../../stores/ui/actions";
import { ICarStintInfo, IStintInfo } from "../../stores/wamp/types";
import { secAsHHMMSS, secAsMMSS, sortCarNumberStr } from "../../utils/output";
import CarFilter from "../live/carFilter";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "../live/util";

interface IGraphData {
  x: string;
  y: number;
}

const { Option } = Select;
const { CheckableTag } = Tag;
interface IColData {
  value: number | [number, string];
}
const CarStintsNivo: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.stints);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();
  const numEntries = (item: ICarStintInfo) => item.history.length + (item.current.isCurrentStint ? 1 : 0);
  const maxStints = carStints.reduce((a, b) => (numEntries(b) > a ? numEntries(b) : a), 0);

  const dataLookup = carStints.reduce((prev, cur) => {
    const stints = [...cur.history].concat(cur.current.isCurrentStint ? cur.current : []);
    prev.set(cur.carNum, stints);
    return prev;
  }, new Map<string, IStintInfo[]>());

  // console.log(x);
  const stintData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    const getValue = (v: IStintInfo) => {
      switch (uiSettings.showAsLabel) {
        case "duration":
          return v.stintTime;
        case "laps":
          return v.numLaps;
      }
    };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["Stint " + (idx + 1)]: getValue(v) }));
    }
    return { ...work };
  });

  const onSelectShowCars = (value: any) => {
    dispatch(stintsSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(stintsSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  // const pits: Map<string, number[]> = new Map();
  // pits.set("1", [12, 20, 14]);

  const pits = [
    { car: "#45", p1: 12, p2: 22, p3: 15 },
    { car: "#77", p1: 10 },
    { car: "#99", p1: 7, p2: 8, p3: 9 },
  ];
  const colorScale = ["Pink", "PaleGoldenrod", "LightGreen"];

  const CustomTooltip = (data: any) => {
    // we get something like this:
    /*
color: "#61cdbb"
data: {Pitstop 1: 140.6333333338498, Pitstop 2: 87.66666666539095, Pitstop 3: 73.79999999892607, Pitstop 4: 129.81666666477759, Pitstop 5: 77.66666666553647, …}
id: "Pitstop 5"
index: 11
indexValue: "12" // my car num
theme: {background: "transparent", fontFamily: "sans-serif", fontSize: 11, textColor: "#333333", axis: {…}, …}
value: 77.66666666553647
*/
    var matchRE = /Stint (\d+)/g;
    var match = matchRE.exec(data.id);
    const stintInfo = dataLookup.get(data.indexValue)!;

    const stintIdx = parseInt(match![1]) - 1;
    const item = stintInfo[stintIdx];
    return (
      <div>
        <strong>
          #{item.carNum} {data.id}
        </strong>
        <br />
        Lap {item.lapExit} - {item.lapEnter} ({item.lapEnter - item.lapExit + 1})
        <br />
        {secAsHHMMSS(item.exitTime)} - {secAsHHMMSS(item.enterTime)}
      </div>
    );
  };
  const labelFormatter = (v: number) => {
    switch (uiSettings.showAsLabel) {
      case "duration":
        return secAsMMSS(v);
      case "laps":
        return v;
    }
  };
  const InternalGraph = (
    // <div style={{ position: "relative" }}>
    //   <div style={{ position: "absolute", width: "100%", height: "100%" }}>
    //     Hallo
    <div style={{ height: "750px" }}>
      <ResponsiveBar
        data={stintData}
        keys={_.range(1, maxStints + 1).map((i) => "Stint " + i)}
        indexBy="car"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        layout="horizontal"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        enableGridY={false}
        enableGridX={true}
        label={(d) => `${labelFormatter(d.value as number)}`}
        animate={false}
        tooltip={(d) => CustomTooltip(d)}
        labelSkipWidth={20}
        axisLeft={{
          format: (value) => `#${value}`,
        }}
      />
    </div>
    //   </div>
    // </div>
  );

  const isSet = (arg: string) => arg.localeCompare(uiSettings.showAsLabel) == 0;
  const onShowModeChange = (e: RadioChangeEvent) => {
    dispatch(stintsSettings({ ...uiSettings, showAsLabel: e.target.value }));
  };
  const ShowMode = (
    <Col>
      <Radio.Group onChange={onShowModeChange} value={uiSettings.showAsLabel}>
        <Radio.Button value="duration">Duration</Radio.Button>
        <Radio.Button value="laps">Laps</Radio.Button>
      </Radio.Group>
    </Col>
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
        {ShowMode}
      </Row>
      {uiSettings.showCars.length === 0 ? <Empty description="Select cars" /> : InternalGraph}
    </>
  );
};

export default CarStintsNivo;
