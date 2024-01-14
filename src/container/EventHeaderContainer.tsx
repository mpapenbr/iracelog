import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Col, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";
import { secAsHHMMSS, secAsString } from "../utils/output";

interface ElapsedProps {
  v: string;
}
const ElapsedRace: React.FC<ElapsedProps> = (props: ElapsedProps) => <p>{props.v} elapsed</p>;

interface RemainingProps {
  laps: number;
  time: number;
}
const RemainingRaceOld: React.FC<RemainingProps> = (props: RemainingProps) => {
  // races can be time and/or lap limited.
  // These are the values to check if such limits do NOT exist
  const NO_LAP_LIMIT = 32767;
  const NO_TIME_LIMIT = 604800;
  const mystyle: React.CSSProperties = { textAlign: "right" };
  if (props.laps !== NO_LAP_LIMIT) {
    if (props.time === NO_TIME_LIMIT) {
      return <p style={mystyle}>{props.laps} laps remaining</p>;
    } else
      return (
        <p style={mystyle}>
          {props.laps} laps/{secAsString(props.time)} remaining
        </p>
      );
  } else {
    return <p style={mystyle}>{secAsString(props.time)} remaining</p>;
  }
};

const RemainingRace: React.FC<RemainingProps> = (props: RemainingProps) => {
  // races can be time and/or lap limited.
  // These are the values to check if such limits do NOT exist
  const NO_LAP_LIMIT = 32767;
  const NO_TIME_LIMIT = 604800;

  if (props.laps !== NO_LAP_LIMIT) {
    if (props.time === NO_TIME_LIMIT) {
      return <span>{props.laps} laps</span>;
    } else
      return props.time > -1 ? (
        <span>
          {props.laps} laps/{secAsString(props.time)}
        </span>
      ) : (
        <span>{props.laps} laps</span>
      );
  } else {
    return props.time > -1 ? <span>{secAsString(props.time)}</span> : <span></span>;
  }
};

export const EventHeaderContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.dashboard);
  const stintInfo = useSelector((state: ApplicationState) => state.raceData.carStints);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.dashboard.showCars);
  const filterCarClasses = useSelector(
    (state: ApplicationState) => state.userSettings.dashboard.filterCarClasses,
  );

  const selectableCars =
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars;
  // console.log(selectableCars);
  const dispatch = useDispatch();

  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const sInfo = useSelector((state: ApplicationState) => state.raceData.sessionInfo);
  const manifestData = useSelector((state: ApplicationState) => state.raceData.manifests.session);

  if (!sInfo.data?.length) {
    return <></>;
  }
  const getValue = (key: string) => {
    return getValueViaSpec(sInfo.data, manifestData, key);
  };
  const numOut = (key: string) => {
    // console.log("key:" + key + " value: " + getValue(key));
    return sprintf("%.1f", getValue(key));
  };
  let flagBackground = "";
  switch (getValue("flagState")) {
    case "CHECKERED":
      flagBackground = "iracelog-background-checkered";
      break;
    case "GREEN":
      flagBackground = "iracelog-background-green";
      break;
  }
  return (
    <Row className="raceHeader">
      <Col flex={1}>
        <table width="100%" style={{ lineHeight: "1rem" }}>
          <tr>
            <td>State</td>
            <td align="right">{getValue("flagState")}</td>
          </tr>
          <tr>
            <td>Air</td>
            <td align="right">{numOut("airTemp")}</td>
          </tr>
          <tr>
            <td>Track</td>
            <td align="right">{numOut("trackTemp")}</td>
          </tr>
        </table>
      </Col>

      {/* <Col flex={1}>
        <div className={flagBackground}></div>
      </Col> */}

      <Col flex={5}>
        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            marginBottom: "1rem",
            lineHeight: "1rem",
          }}
        >
          {eventInfo.name}
          <br />
          {eventInfo.trackDisplayName}
        </p>
      </Col>
      {/* <Col flex={1}>
        <div className={flagBackground} style={{ display: "flow", verticalAlign: "center" }}></div>
      </Col> */}
      <Col flex={1}>
        <table width="100%" style={{ lineHeight: "1rem" }}>
          <tr>
            <td>Sim-Time</td>
            <td align="right">{secAsHHMMSS(getValue("timeOfDay"))}</td>
          </tr>
          <tr>
            <td>Elapsed</td>
            <td align="right">{secAsString(getValue("sessionTime"))}</td>
          </tr>
          <tr>
            <td>Remaining</td>
            <td align="right">
              {<RemainingRace time={getValue("timeRemain")} laps={getValue("lapsRemain")} />}
            </td>
          </tr>
        </table>
      </Col>
    </Row>
  );
};
