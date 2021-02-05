import { Cascader, Checkbox, Col, InputNumber, Row, Select } from "antd";
import { CascaderValueType } from "antd/lib/cascader";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { loadEventData } from "../stores/raceevents/actions";
import { IGap } from "../stores/types/gaps";
import { adjustRawNumber } from "../utils/output";
import GapsGraph from "./gap/gapsGraph";
import { collectCarClasses, collectCompactDriverNames, collectCompactTeamNames, extractRaceUUID } from "./util/common";

const { Option } = Select;

interface CarSelection {
  carIdx: number;
}
const GapProgression: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [filterMode, setFilterMode] = useState(true);
  const [filterSecs, setFilterSecs] = useState(500);
  const [selectedCarClass, setSelectedCarClass] = useState(0);
  const location = useLocation();

  const myId = extractRaceUUID(location.pathname);
  const dispatch = useDispatch();

  const [left, setLeft] = useState({ carIdx: 0 } as CarSelection);
  const [right, setRight] = useState({ carIdx: 0 } as CarSelection);
  const [gaps, setGaps] = useState([] as IGap[]);

  useEffect(() => {
    console.log("Left or right have changed " + myId + " (gaps)");
    if (left.carIdx > 0 && right.carIdx > 0) {
      console.log("Issue reload gaps " + myId + " (gaps)");
      RaceEventService.gaps("TBD_TOKEN_FOR_ENSURE_DATA", myId, raceSession, left.carIdx, right.carIdx).then((d) =>
        setGaps(d as IGap[])
      );
    }
  }, [left, right]);

  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);

  const raceSession = _.last(raceContainer.summary.sessionSummaries)?.sessionNum!;
  const onReloadRequested = () => {
    dispatch(loadEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  };

  let source = raceContainer.eventData.teamRacing
    ? collectCompactTeamNames(raceContainer.drivers)
    : collectCompactDriverNames(raceContainer.drivers);
  source = source.filter((d) => (selectedCarClass > 0 ? d.carClassId === selectedCarClass : true));

  const options = source
    .sort((a, b) => a.carNumber - b.carNumber)
    .map((d) => ({
      value: d.id,
      label: sprintf("#%s %s", adjustRawNumber(d.carNumberRaw), d.name),
    }));

  const onChangeLeft = (value: CascaderValueType) => {
    setLeft({ carIdx: value[0] as number });
  };
  const onChangeRight = (value: any) => {
    console.log(value);
    setRight({ carIdx: value[0] as number });
  };

  const carClassOptions = collectCarClasses(raceContainer.drivers).map((d) => (
    <Option key={_.uniqueId()} value={d.id}>
      {d.name}
    </Option>
  ));

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

  const onFilterSecsChange = (value: any) => {
    console.log(value);
    setFilterSecs(value as number);
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
        <Col span={6}>
          <InputNumber
            defaultValue={filterSecs}
            precision={0}
            step={10}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? v.replace("sec", "") : "")}
            onChange={onFilterSecsChange}
          />
          <Checkbox defaultChecked={filterMode} checked={filterMode} onChange={onCheckboxChange}>
            Filtered graphs
          </Checkbox>
        </Col>
      </Row>
      {gaps.length > 0 ? (
        <>
          <Row gutter={16}>
            <Col span={24}>
              <GapsGraph raceContainer={raceContainer} gaps={gaps} range={filterMode ? filterSecs : undefined} />
            </Col>
          </Row>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default GapProgression;
