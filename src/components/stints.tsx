import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Row, Spin, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { defaultDriverData, IDriver, IDriverMeta } from "../stores/drivers/types";
import { ensureEventData } from "../stores/raceevents/actions";
import { IRaceContainer } from "../stores/raceevents/types";
import { ILaptimeExtended } from "../stores/types/laptimes";
import { IPitstopMeta } from "../stores/types/pitstops";
import { IStintData } from "../stores/types/stints";
import { uiSetStintNo } from "../stores/ui/actions";
import { adjustRawNumber, lapTimeString } from "../utils/output";

// some helper
// TODO: move this to a more common location. we need this very often
const closestDriverEntry = (driverData: IDriverMeta[], carIdx: number, sessionTick: number): IDriver => {
  const invSortedByTime = driverData
    .filter((d) => d.data.carIdx === carIdx)
    .filter((d) => d.sessionTick <= sessionTick)
    .sort((a, b) => b.sessionTime - a.sessionTime);
  // console.log(invSortedByTime);
  return invSortedByTime.length > 0 ? invSortedByTime[0].data : defaultDriverData();
};

const closestDriverEntryByTime = (
  driverData: IDriverMeta[],
  carIdx: number,
  sessionNum: number,
  sessionTime: number
): IDriver => {
  const invSortedByTime = driverData
    .filter((d) => d.data.carIdx === carIdx)
    .filter((d) => d.sessionNum == sessionNum)
    .filter((d) => d.sessionTime <= sessionTime)
    .sort((a, b) => b.sessionTime - a.sessionTime);
  // console.log(invSortedByTime);
  return invSortedByTime.length > 0 ? invSortedByTime[0].data : defaultDriverData();
};

const teamDrivers = (carIdx: number, rc: IRaceContainer) => {
  const rawNames = rc.drivers.filter((d) => d.data.carIdx === carIdx).map((d) => d.data.userName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};
export interface ICarUserProps {
  driverData: IDriverMeta;
  teamRacing: boolean;
  raceContainer: IRaceContainer;
}
const CarDriver: React.FC<ICarUserProps> = (props: ICarUserProps) => {
  if (props.teamRacing) {
    const x = (
      <Tooltip
        title={teamDrivers(props.driverData.data.carIdx, props.raceContainer).map((n) => (
          <p key={_.uniqueId()}>{n}</p>
        ))}
      >
        {props.driverData.data.teamName}
      </Tooltip>
    );
    return x;
  } else return <>{props.driverData.data.userName}</>;
};

const Stints: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const regex = /.*?\/details\/(?<myId>.*?)\/.*$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  const dispatch = useDispatch();
  // const empty : IPitstopMeta[] = [];
  const [pitstops, setPitstops] = useState([] as IPitstopMeta[]);
  const [stints, setStints] = useState([] as IStintData[]);
  useEffect(() => {
    console.log("Now trigger load event details for " + myId + " (pitstops)");

    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
    RaceEventService.pitStops("TBD_TOKEN_PITSTOPS", myId).then((v) => {
      setPitstops(v);
    });
  }, [loadTrigger]);
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  if (!raceContainer.loaded) {
    return <Spin />;
  }
  let tmpMarkCarIdx: number[] = [];
  const driverData = raceContainer.drivers
    .filter((v) => {
      const res = tmpMarkCarIdx.findIndex((tmpV) => tmpV === v.data.carIdx);
      if (res === -1) {
        tmpMarkCarIdx.push(v.data.carIdx);
        return true;
      }
      return false;
    })
    .sort((a, b) => a.data.carNumber - b.data.carNumber);

  let work = new Map<Number, IPitstopMeta[]>();
  // use this in the future.
  // const raceSession = _.last(raceContainer.eventData.sessions)?.num;

  const raceSession = _.last(raceContainer.summary.sessionSummaries)?.sessionNum!;

  pitstops
    .filter((p) => p.sessionNum === raceSession)
    .forEach((p) => {
      const tmp = work.get(p.data.carIdx);
      if (tmp !== undefined) {
        tmp.push(p);
      } else {
        work.set(p.data.carIdx, [p]);
      }
    });

  const pitstopsShort = (carIdx: number): string => {
    const stops = work.get(carIdx);
    if (stops !== undefined) {
      return stops.map((d) => sprintf("%.1f", d.data.pitLaneTime)).join(", ");
    }
    return "n.a.";
  };

  const onLoadStints = (e: React.MouseEvent<HTMLButtonElement>) => {
    // dispatch(deleteRaceEvent(e.currentTarget.value, "authTokenTBD"));
    console.log("shouldLoad stints for " + e.currentTarget.value);
    dispatch(uiSetStintNo(0));
    const carIdx = parseInt(e.currentTarget.value);
    RaceEventService.stints("TBD_TOKEN_PITSTOPS", myId, raceSession, carIdx).then((v) => {
      setStints(v);
    });
  };

  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Stints">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onLoadStints} />
      </Tooltip>
    </div>
  );

  const columns: ColumnsType<IDriverMeta> = [
    { key: "carNum", title: "#", dataIndex: ["data", "carNumberRaw"], render: (d) => adjustRawNumber(d) },
    {
      key: "name",
      title: "Name",
      render: (d) => (
        <CarDriver raceContainer={raceContainer} teamRacing={raceContainer.eventData.teamRacing != 0} driverData={d} />
      ),
    },

    { key: "action", title: "Action", dataIndex: ["data", "carIdx"], render: (d) => extraButtons(d) },
  ];

  return (
    <Row gutter={16}>
      <Col>
        <Table
          size="small"
          pagination={false}
          dataSource={driverData}
          columns={columns}
          rowKey={(d) => d.data.carIdx}
        />
      </Col>
      {stints !== undefined && stints.length > 0 ? (
        <Row>
          <Col>
            <StintDetails stints={stints} raceContainer={raceContainer} />
          </Col>
        </Row>
      ) : (
        <div />
      )}
    </Row>
  );
};

interface IStintProps {
  stints: IStintData[];
  raceContainer: IRaceContainer;
}

const StintDetails: React.FC<IStintProps> = (props: IStintProps) => {
  const dings = (d: IStintData): string => {
    return closestDriverEntryByTime(
      props.raceContainer.drivers,
      d.laps[0].lapData.carIdx,
      d.laps[0].sessionNum,
      d.laps[0].sessionTime
    ).userName;
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
        { key: "filteredLaps", title: "In Range", align: "right", dataIndex: ["ranged", "count"], render: (d) => d },
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
    { key: "action", title: "Action", dataIndex: ["stintNo"], render: (d) => extraButtons(d) },
    // { key: "rollAvg", title: "Roll AvgTime", dataIndex: ["data"], render: (d, v) => lapTimeString(rollingAvg(v)) },
  ];

  return (
    <>
      <Row>
        <Table
          size="small"
          pagination={false}
          dataSource={props.stints}
          columns={columns}
          rowKey={(d) => sprintf("lt-%d", _.uniqueId())}
        />
      </Row>
      <Row>
        {stintLapsToShow > 0 ? (
          <StintLaps raceContainer={props.raceContainer} stint={props.stints[stintLapsToShow - 1]} />
        ) : (
          <p>Nothing to show</p>
        )}
      </Row>
    </>
  );
};

interface IStintLapsProps {
  stint: IStintData;
  raceContainer: IRaceContainer;
}

const StintLaps: React.FC<IStintLapsProps> = (props: IStintLapsProps) => {
  const dings = (d: ILaptimeExtended): string => {
    return closestDriverEntryByTime(props.raceContainer.drivers, d.lapData.carIdx, d.sessionNum, d.sessionTime)
      .userName;
  };
  const columns: ColumnsType<ILaptimeExtended> = [
    { key: "lapNo", title: "Lap", align: "right", dataIndex: ["lapData", "lapNo"], render: (d) => d },
    { key: "driver", title: "Driver", align: "left", render: (d) => dings(d) },
    {
      key: "laptime",
      title: "Laptime",
      align: "right",
      dataIndex: ["lapData", "lapTime"],
      render: (d) => lapTimeString(d),
    },
    {
      title: "Averages",
      children: [
        {
          key: "rollAvg",
          title: "Overall",
          align: "right",
          dataIndex: ["rollAvg"],
          render: (d) => lapTimeString(d),
        },
        {
          key: "rollAvgFiltered",
          title: "Filtered",
          align: "right",
          dataIndex: ["rollAvgFiltered"],
          render: (d) => lapTimeString(d),
        },
      ],
    },
    {
      key: "filter",
      title: "Filtered",
      align: "left",
      dataIndex: ["filtered"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "in",
      title: "Inlap",
      align: "left",
      dataIndex: ["lapData", "inLap"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "out",
      title: "Outlap",
      align: "left",
      dataIndex: ["lapData", "outLap"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "incomplete",
      title: "Incomplete",
      align: "left",
      dataIndex: ["lapData", "incomplete"],
      render: (d) => (d ? "yes" : ""),
    },
  ];

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={props.stint.laps}
      columns={columns}
      rowKey={(d) => sprintf("sll-%d", _.uniqueId())}
    />
  );
};

export default Stints;
