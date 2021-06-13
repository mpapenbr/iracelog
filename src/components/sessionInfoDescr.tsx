import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Descriptions, Empty } from "antd";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";
import { SessionManifest } from "../stores/wamp/types";
import { secAsString } from "../utils/output";

const SessionInfoDescription: React.FC<{}> = () => {
  const sInfo = useSelector((state: ApplicationState) => state.raceData.sessionInfo);
  const getValue = (key: string) => {
    return getValueViaSpec(sInfo.data, SessionManifest, key);
  };
  const numOut = (key: string) => {
    return sprintf("%.1f", getValue(key));
  };
  return sInfo.data.length > 0 ? (
    <Descriptions bordered>
      <Descriptions.Item label="Session time">{secAsString(getValue("sessionTime"))}</Descriptions.Item>
      <Descriptions.Item label="Remaining">{secAsString(getValue("timeRemain"))}</Descriptions.Item>
      <Descriptions.Item label="Time">{secAsString(getValue("timeOfDay"))}</Descriptions.Item>
      <Descriptions.Item label="Flag">{getValue("flagState")}</Descriptions.Item>
      <Descriptions.Item label="Track temp">{numOut("trackTemp")}</Descriptions.Item>
      <Descriptions.Item label="Air temp">{numOut("airTemp")}</Descriptions.Item>
      <Descriptions.Item label="Wind direction">{numOut("windDir")}</Descriptions.Item>
      <Descriptions.Item label="Wind speed (m/s)">{numOut("windVel")}</Descriptions.Item>
    </Descriptions>
  ) : (
    <Empty description="No data available" />
  );
};
export default SessionInfoDescription;
