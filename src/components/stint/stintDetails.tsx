import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Empty, Row, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { IDriver } from "../../stores/drivers/types";
import { IRaceContainer } from "../../stores/raceevents/types";
import { IStintData } from "../../stores/types/stints";
import { uiSetStintNo } from "../../stores/ui/actions";
import { adjustRawNumber, lapTimeString } from "../../utils/output";
import { closestDriverEntryByTime, stintDuration } from "../util/common";
import StintLaps from "./stintLaps";

interface IStintProps {
  stints: IStintData[];
  raceContainer: IRaceContainer;
}

const StintDetails: React.FC<IStintProps> = (props: IStintProps) => {
  const dings = (d: IStintData): string => {
    if (d.laps.length > 0) {
      return closestDriverEntryByTime(
        props.raceContainer.drivers,
        d.laps[0].lapData.carIdx,
        d.laps[0].sessionNum,
        d.laps[0].sessionTime
      ).userName;
    } else {
      return "Unknown ";
    }
  };

  const driverData = (d: IStintData): IDriver => {
    return closestDriverEntryByTime(
      props.raceContainer.drivers,
      d.laps[0].lapData.carIdx,
      d.laps[0].sessionNum,
      d.laps[0].sessionTime
    );
  };

  const dispatch = useDispatch();
  // const [stintLapsToShow, setStintLapsToShow] = useState(0);
  const stintLapsToShow = useSelector((state: ApplicationState) => state.ui.data.stint.stintNo);
  const onSelectStintLapsToShow = (e: React.MouseEvent<HTMLButtonElement>) => {
    // dispatch(deleteRaceEvent(e.currentTarget.value, "authTokenTBD"));
    console.log("should show laps for stint  " + e.currentTarget.value);
    const stintNo = parseInt(e.currentTarget.value);
    // setStintLapsToShow(stintNo);
    dispatch(uiSetStintNo(stintNo));
  };

  const stintRange = (d: IStintData): string => {
    if (d.laps.length === 0) {
      return "n.a. " + d.stintNo;
    }
    return sprintf("%d - %d", d.laps[0].lapData.lapNo, _.last(d.laps)!.lapData.lapNo);
  };
  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Laps">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onSelectStintLapsToShow} />
      </Tooltip>
    </div>
  );

  const columns: ColumnsType<IStintData> = [
    { key: "stintNo", title: "Stint", align: "right", dataIndex: ["stintNo"], render: (d) => d },
    { key: "numLaps", title: "Laps", align: "right", dataIndex: ["all", "count"], render: (d) => d },
    { key: "driver", title: "Driver", align: "left", render: (d) => dings(d) },
    {
      title: "Overall",
      children: [
        { key: "allMin", title: "Min", align: "right", dataIndex: ["all", "min"], render: (d) => lapTimeString(d) },
        { key: "allMax", title: "Max", align: "right", dataIndex: ["all", "max"], render: (d) => lapTimeString(d) },
        { key: "allAvg", title: "Avg", align: "right", dataIndex: ["all", "avg"], render: (d) => lapTimeString(d) },
      ],
    },
    {
      title: "Filtered",
      children: [
        // { key: "filteredLaps", title: "In Range", align: "right", dataIndex: ["ranged", "count"], render: (d) => d },
        {
          key: "filteredMin",
          title: "Min",
          align: "right",
          dataIndex: ["ranged", "min"],
          render: (d) => lapTimeString(d),
        },
        {
          key: "filteredMax",
          title: "Max",
          align: "right",
          dataIndex: ["ranged", "max"],
          render: (d) => lapTimeString(d),
        },
        {
          key: "filteredAvg",
          title: "Avg",
          align: "right",
          dataIndex: ["ranged", "avg"],
          render: (d) => lapTimeString(d),
        },
      ],
    },

    { key: "stintTime", title: "Duration", render: (d) => stintDuration(d) },
    { key: "stintRange", align: "center", title: "Range", render: (d) => stintRange(d) },
    { key: "action", title: "Action", dataIndex: ["stintNo"], render: (d) => extraButtons(d) },
    // { key: "rollAvg", title: "Roll AvgTime", dataIndex: ["data"], render: (d, v) => lapTimeString(rollingAvg(v)) },
  ];
  const header = () => {
    const dd = driverData(props.stints[0]);
    const title = sprintf(
      "#%s %s",
      adjustRawNumber(dd.carNumberRaw),
      props.raceContainer.eventData.teamRacing ? dd.teamName : dd.userName
    );
    return (
      <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }} size="small" title={title}>
        <Descriptions.Item label="Car">{dd.carName}</Descriptions.Item>
        <Descriptions.Item label="Car class">{dd.carClassShortName}</Descriptions.Item>
      </Descriptions>
    );
  };
  return (
    <>
      {/* <Row>
        <Col>{header()}</Col>
      </Row> */}

      <Row>
        <Col span={24}>
          <Table
            size="small"
            pagination={false}
            dataSource={props.stints}
            columns={columns}
            title={header}
            rowKey={(d) => sprintf("lt-%d", _.uniqueId())}
          />
        </Col>
      </Row>
      <Row>
        {stintLapsToShow > 0 ? (
          <StintLaps raceContainer={props.raceContainer} stint={props.stints[stintLapsToShow - 1]} />
        ) : (
          <Empty />
        )}
      </Row>
    </>
  );
};
export default StintDetails;
