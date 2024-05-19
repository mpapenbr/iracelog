import { Checkbox, Col, InputNumber, Row } from "antd";
import * as React from "react";
import LeaderGraph from "../components/antcharts/leadergraph";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateRaceGraph } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

export const RaceGraphContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.raceGraph);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: IMultiCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateRaceGraph(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(
          updateGlobalSettings({
            ...stateGlobalSettings,
            showCars: arg.showCars,
            filterCarClasses: arg.filterCarClasses,
          }),
        );
      }
    },
  };
  const filterProps = prepareFilterData(inputData);
  const props = {
    ...filterProps,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(updateRaceGraph(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const onCheckboxChange = () => {
    const curSettings = {
      ...userSettings,
      gapRelativeToClassLeader: !userSettings.gapRelativeToClassLeader,
    };
    dispatch(updateRaceGraph(curSettings));
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(updateRaceGraph(curSettings));
  };

  // const props = {
  //   availableCars: orderedSelectableCars,
  //   availableClasses: carClasses.map((v) => v.name),
  //   selectedCars: showCars,
  //   selectedCarClasses: filterCarClasses,
  //   onSelectCarFilter: (selection: string[]) => {
  //     const curSettings = { ...userSettings, showCars: selection };
  //     dispatch(raceGraphSettings(curSettings));
  //   },
  //   onSelectCarClassFilter: onSelectCarClassChange,
  // };

  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
        <Col span={5}>
          <InputNumber
            value={userSettings.deltaRange}
            precision={0}
            step={10}
            min={0}
            style={{ width: "22ch" }}
            addonAfter={"sec"}
            addonBefore={"Delta"}
            // formatter={(v) => sprintf("%d sec", v)}
            // parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onDeltaRangeChange}
          />
        </Col>
        <Col span={3}>
          <Checkbox
            defaultChecked={userSettings.gapRelativeToClassLeader}
            checked={userSettings.gapRelativeToClassLeader}
            onChange={onCheckboxChange}
          >
            Gaps to class leader
          </Checkbox>
        </Col>
      </Row>

      <LeaderGraph showCars={props.selectedCars} />
      {/* <RaceGraphRecharts /> */}
    </>
  );
};
