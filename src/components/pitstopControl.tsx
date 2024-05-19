import { Checkbox, InputNumber, Row } from "antd";
import React from "react";
import { useAppDispatch, useAppSelector } from "../stores";
import { updatePits } from "../stores/grpc/slices/userSettingsSlice";

const PitstopControl: React.FC = () => {
  const userSettings = useAppSelector((state) => state.userSettings.pits);

  const dispatch = useAppDispatch();

  const onThresholdChange = (value: any) => {
    const curSettings = { ...userSettings, hideThreshold: value };
    dispatch(updatePits(curSettings));
  };
  const onCheckboxHideLongPitstop = (value: any) => {
    const curSettings = { ...userSettings, hideLongPitstops: !userSettings.hideLongPitstops };
    dispatch(updatePits(curSettings));
  };
  const onCheckboxShowRunningOnly = (value: any) => {
    const curSettings = { ...userSettings, showRunningOnly: !userSettings.showRunningOnly };
    dispatch(updatePits(curSettings));
  };

  return (
    <>
      <Row>
        <Checkbox
          defaultChecked={userSettings.hideLongPitstops}
          onChange={onCheckboxHideLongPitstop}
        >
          Auto hide at
        </Checkbox>

        <InputNumber
          // defaultValue={userSettings.hideThreshold}
          value={userSettings.hideThreshold}
          precision={0}
          step={10}
          min={0}
          style={{ width: "14ch" }}
          addonAfter={"sec"}
          // formatter={(v) => sprintf("%d sec", v)}
          // parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
          onChange={onThresholdChange}
        />
      </Row>

      {/*
       temp deactivated. Not sure if this is practical. 
       Main reason: OUT may be a temporary state (connection loss/driver change). 
       We may need to have an OUT_CANDIDATE intermediate state to solve this
      <Row>
        <Checkbox defaultChecked={userSettings.showRunningOnly} onChange={onCheckboxShowRunningOnly}>
          Running cars only
        </Checkbox>
      </Row> */}
    </>
  );
};

export default PitstopControl;
