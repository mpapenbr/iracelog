import { TrackWetness } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/common/v1/common_pb";
import { Col, Row } from "antd";
import * as React from "react";
import { sprintf } from "sprintf-js";
import { useAppSelector } from "../stores";
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
  const sInfo = useAppSelector((state) => state.session);
  const eInfo = useAppSelector((state) => state.eventInfo);

  if (sInfo.flagState === "") {
    return <></>;
  }
  const eventInfo = { name: eInfo.event.name, trackDisplayName: eInfo.track.name };
  const numOut = (v: number) => {
    // console.log("key:" + key + " value: " + getValue(key));
    return sprintf("%.1f", v);
  };

  const trackLabel = () => {
    const trackCondidtion = (v: TrackWetness): string => {
      switch (v) {
        case TrackWetness.UNSPECIFIED:
          return "";
        case TrackWetness.DRY:
          return "(dry)";
        case TrackWetness.MOSTLY_DRY:
          return "(mostly dry)";
        case TrackWetness.VERY_LIGHTLY_WET:
          return "(very lightly wet)";
        case TrackWetness.LIGHTLY_WET:
          return "(lightly wet)";
        case TrackWetness.MODERATELY_WET:
          return "(moderately wet)";
        case TrackWetness.VERY_WET:
          return "(very wet)";
        case TrackWetness.EXTREMELY_WET:
          return "(extremely wet)";
        default:
          return v + "";
      }
    };
    return "Track " + trackCondidtion(sInfo.trackWetness);
  };

  let flagBackground = "";
  switch (sInfo.flagState) {
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
          <tbody>
            <tr>
              <td>State</td>
              <td align="right">{sInfo.flagState}</td>
            </tr>
            <tr>
              <td>Air</td>
              <td align="right">{numOut(sInfo.airTemp)}</td>
            </tr>
            <tr>
              <td>{trackLabel()}</td>
              <td align="right">{numOut(sInfo.trackTemp)}</td>
            </tr>
          </tbody>
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
          <tbody>
            <tr>
              <td>Sim-Time</td>
              <td align="right">{secAsHHMMSS(sInfo.timeOfDay)}</td>
            </tr>
            <tr>
              <td>Elapsed</td>
              <td align="right">{secAsString(sInfo.sessionTime)}</td>
            </tr>
            <tr>
              <td>Remaining</td>
              <td align="right">
                {<RemainingRace time={sInfo.timeRemain} laps={sInfo.lapsRemain} />}
              </td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};
