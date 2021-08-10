import { Col, Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarClassFilter from "../components/live/carClassFilter";
import StintSeatTime from "../components/nivo/stintsummary/seattime";
import StintCircle from "../components/nivo/stintsummary/stintcircle";
import StintLaps from "../components/nivo/stintsummary/stintlaps";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import StintSummary from "../components/stintSummary";
import { ApplicationState } from "../stores";
import { stintSummarySettings } from "../stores/ui/actions";

const { Option } = Select;

export const StintSummaryContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stintSummary);
  const stintInfo = useSelector((state: ApplicationState) => state.raceData.carStints);

  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(stintSummarySettings(curSettings));
  };

  const onFilterSecsChange = (value: any) => {
    const curSettings = { ...userSettings, filterSecs: value };
    dispatch(stintSummarySettings(curSettings));
  };

  const referenceOptions = cars
    .filter((c) => {
      return userSettings.filterCarClasses.length
        ? userSettings.filterCarClasses.find((item) => item === c.carClass)
        : true;
    })
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, carNum: value as string, showStint: 0 };
    dispatch(stintSummarySettings(curSettings));
    // setBrushKeeper({});
  };

  const props = { carNum: userSettings.carNum };
  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={userSettings.carNum ? userSettings.carNum : undefined}
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
          selectedCarClasses={userSettings.filterCarClasses}
        />
      </Row>
      {userSettings.carNum ? (
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
              {/* out of order - the nivo bullets don't really fit as boxplots
              <Row>
                <StintBullets {...props} />
              </Row> */}
            </Col>
          </Row>
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
