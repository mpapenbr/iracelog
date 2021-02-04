import { Cascader, Checkbox, Col, Row, Select, Spin } from "antd";
import { CascaderValueType } from "antd/lib/cascader";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";
import { ensureEventStints, loadEventData } from "../stores/raceevents/actions";
import { ICarStintData } from "../stores/types/stints";
import { adjustRawNumber } from "../utils/output";
import StintLapsCompareGraph from "./stint/stintLapsCompareGraph";
import StintLapsCumCompareGraph from "./stint/stintLapsCumCompareGraph";
import { collectCarClasses, collectCompactDriverNames, collectCompactTeamNames, extractRaceUUID } from "./util/common";

const { Option } = Select;

interface StintSelection {
  carIdx: number;
  stintNo: number;
}
const StintCompare: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [filterMode, setFilterMode] = useState(true);
  const [selectedCarClass, setSelectedCarClass] = useState(0);
  const location = useLocation();

  const myId = extractRaceUUID(location.pathname);
  const dispatch = useDispatch();

  const [left, setLeft] = useState({ carIdx: 0, stintNo: 0 } as StintSelection);
  const [right, setRight] = useState({ carIdx: 0, stintNo: 0 } as StintSelection);

  useEffect(() => {
    console.log("Now trigger load stints for " + myId + " (all car stints)");
    dispatch(ensureEventStints("TBD_TOKEN_FOR_ENSURE_DATA", myId, 0));
  }, [loadTrigger]);

  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  if (!raceContainer.carStintsLoaded) {
    return <Spin />;
  }
  const raceSession = _.last(raceContainer.summary.sessionSummaries)?.sessionNum!;
  const onReloadRequested = () => {
    dispatch(loadEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  };

  let source = raceContainer.eventData.teamRacing
    ? collectCompactTeamNames(raceContainer.drivers)
    : collectCompactDriverNames(raceContainer.drivers);
  source = source.filter((d) => (selectedCarClass > 0 ? d.carClassId === selectedCarClass : true));

  const collectStintNumbers = (carIdx: number) => {
    const found: ICarStintData | undefined = raceContainer.carStints.find((cs) => cs.carIdx === carIdx);
    if (found !== undefined) {
      return found.stints
        .filter((d) => d.laps.length > 0)
        .map((d) => ({
          value: d.stintNo,
          label: sprintf("%s (%d-%d)", d.stintNo, d.laps[0].lapData.lapNo, _.last(d.laps)?.lapData.lapNo),
        }));
    } else return [];
  };
  const options = source
    .sort((a, b) => a.carNumber - b.carNumber)
    .map((d) => ({
      value: d.id,
      label: sprintf("#%s %s", adjustRawNumber(d.carNumberRaw), d.name),
      children: collectStintNumbers(d.id),
    }));

  const onChangeLeft = (value: CascaderValueType) => {
    setLeft({ carIdx: value[0] as number, stintNo: value[1] as number });
  };
  const onChangeRight = (value: any) => {
    console.log(value);
    setRight({ carIdx: value[0] as number, stintNo: value[1] as number });
  };

  const carClassOptions = collectCarClasses(raceContainer.drivers).map((d) => <Option value={d.id}>{d.name}</Option>);

  const findStint = (sel: StintSelection) => {
    return raceContainer.carStints.find((d) => d.carIdx === sel.carIdx)?.stints.find((d) => d.stintNo === sel.stintNo)!;
  };

  const onCheckboxChange = () => {
    console.log("set filter now to " + !filterMode);
    setFilterMode(!filterMode);
  };

  const onSelectCarClassChange = (value: any) => {
    if (value === undefined) {
      setSelectedCarClass(0); // this is the case when "clear" is issued
    } else {
      setSelectedCarClass(value as number);
    }
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={14}>
          <Cascader style={{ width: "50%" }} options={options} onChange={onChangeLeft} />
          <Cascader style={{ width: "50%" }} options={options} onChange={onChangeRight} />
        </Col>
        <Col span={4}>
          <Select style={{ width: "100%" }} allowClear placeholder="Car class filter" onChange={onSelectCarClassChange}>
            {carClassOptions}
          </Select>
        </Col>
        <Col span={3}>
          <Checkbox defaultChecked={filterMode} checked={filterMode} onChange={onCheckboxChange}>
            Filtered graphs
          </Checkbox>
        </Col>
      </Row>
      {left.carIdx > 0 && right.carIdx > 0 ? (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <StintLapsCompareGraph
                  raceContainer={raceContainer}
                  reference={findStint(left)}
                  other={findStint(right)}
                  filterLaps={filterMode}
                />
              </div>
            </Col>

            <Col span={12}>
              <div>
                <StintLapsCumCompareGraph
                  raceContainer={raceContainer}
                  reference={findStint(left)}
                  other={findStint(right)}
                  filterLaps={filterMode}
                />
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default StintCompare;
