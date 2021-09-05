import { Col, Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarClassFilter from "../components/live/carClassFilter";
import StintSeatTime from "../components/nivo/stintsummary/seattime";
import StintBoxplot from "../components/nivo/stintsummary/stintboxplot";
import StintCircle from "../components/nivo/stintsummary/stintcircle";
import StintLaps from "../components/nivo/stintsummary/stintlaps";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import StintSummary from "../components/stintSummary";
import { ApplicationState } from "../stores";
import { globalSettings, stintSummarySettings } from "../stores/ui/actions";

const { Option } = Select;

export const StintSummaryContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stintSummary);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const dispatch = useDispatch();

  const selectSettings = () => {
    if (stateGlobalSettings.syncSelection) {
      return {
        referenceCarNum: stateGlobalSettings.referenceCarNum,
        filterCarClasses: stateGlobalSettings.filterCarClasses,
      };
    } else {
      return { referenceCarNum: userSettings.carNum, filterCarClasses: userSettings.filterCarClasses };
    }
  };
  const { referenceCarNum, filterCarClasses } = selectSettings();

  const onSelectCarClassChange = (values: string[]) => {
    const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(stintSummarySettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, filterCarClasses: values }));
    }
  };

  const onFilterSecsChange = (value: any) => {
    const curSettings = { ...userSettings, filterSecs: value };
    dispatch(stintSummarySettings(curSettings));
  };

  const referenceOptions = cars
    .filter((c) => {
      return filterCarClasses.length ? filterCarClasses.find((item) => item === c.carClass) : true;
    })
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, carNum: value as string, showStint: 0 };
    dispatch(stintSummarySettings(curSettings));
    dispatch(globalSettings({ ...stateGlobalSettings, referenceCarNum: curSettings.carNum }));
  };

  const props = { carNum: referenceCarNum };
  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={referenceCarNum}
            placeholder="Select car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarClassFilter
          availableClasses={carClasses.map((v) => v.name)}
          onSelectCarClassFilter={onSelectCarClassChange}
          selectedCarClasses={filterCarClasses}
        />
      </Row>
      {referenceCarNum ? (
        <>
          <Divider />
          <Row gutter={16}>
            <StintStretch {...props} width={800} />
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <StintSummary {...props} />
            </Col>
            <Col span={12}>
              <Row>
                <StintSeatTime {...props} />
              </Row>
              <Row gutter={16}>
                <Col>
                  <StintCircle {...props} />
                </Col>
                <Col>
                  <StintLaps {...props} />
                </Col>
                {/* out of order - no real benefit, pit stops are way too small
                 <Col>
                  <StintCircleWithPits {...props} />
                </Col> */}
              </Row>

              <Row>
                <StintBoxplot {...props} />
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
