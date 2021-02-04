import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Row, Spin, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import _, { range } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { IDriverMeta } from "../stores/drivers/types";
import { ensureEventData } from "../stores/raceevents/actions";
import { ILaptimeMeta } from "../stores/types/laptimes";
import { IPitstopMeta } from "../stores/types/pitstops";
import { adjustRawNumber, lapTimeString } from "../utils/output";

const PitStops: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const regex = /.*?\/details\/(?<myId>.*?)\/.*$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  const dispatch = useDispatch();
  // const empty : IPitstopMeta[] = [];
  const [pitstops, setPitstops] = useState([] as IPitstopMeta[]);
  const [laptimes, setLaptimes] = useState([] as ILaptimeMeta[]);
  useEffect(() => {
    console.log("Now trigger load event details for " + myId + " (pitstops)");

    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
    RaceEventService.pitStops("TBD_TOKEN_PITSTOPS", myId).then((v) => {
      setPitstops(v);
    });
  }, [loadTrigger]);
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  if (!raceContainer.eventLoaded) {
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

  const onLoadLaptimes = (e: React.MouseEvent<HTMLButtonElement>) => {
    // dispatch(deleteRaceEvent(e.currentTarget.value, "authTokenTBD"));
    console.log("shouldLoad laptimes for " + e.currentTarget.value);
    const carIdx = parseInt(e.currentTarget.value);
    RaceEventService.laptimes("TBD_TOKEN_PITSTOPS", myId, raceSession, carIdx).then((v) => {
      setLaptimes(v);
    });
  };

  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Laptimes">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onLoadLaptimes} />
      </Tooltip>
    </div>
  );

  const columns: ColumnsType<IDriverMeta> = [
    { key: "carNum", title: "#", dataIndex: ["data", "carNumberRaw"], render: (d) => adjustRawNumber(d) },
    { key: "name", title: "Name", dataIndex: ["data", "userName"] },
    { key: "stops", title: "Stops", dataIndex: ["data", "carIdx"], render: (d) => pitstopsShort(d) },
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
      {laptimes !== undefined && laptimes.length > 0 ? (
        <Col>
          <Laptimes laptimes={laptimes} />
        </Col>
      ) : (
        <div />
      )}
    </Row>
  );
};

interface ILaptimesProps {
  laptimes: ILaptimeMeta[];
}

const Laptimes: React.FC<ILaptimesProps> = (props: ILaptimesProps) => {
  const maxSectors = props.laptimes.reduce((prev, current, idx, arr) => Math.max(current.data.sectors.length, prev), 0);
  const rangePct = 0.02;
  const overallAvgWork = props.laptimes.filter(
    (v) => v.data.inLap === false && v.data.outLap === false && v.data.incomplete === false && v.data.lapNo > 0
  );
  const overallAvg = overallAvgWork.map((v) => v.data.lapTime).reduce((a, b) => a + b, 0) / overallAvgWork.length;
  // console.log(overallAvgWork.map((v) => v.data.lapTime));
  // console.log(overallAvg);
  const rollingAvg = (d: ILaptimeMeta) => {
    let firstFullIdx = props.laptimes.indexOf(d);
    let found = false;
    while (!found && firstFullIdx > 0) {
      if (props.laptimes[firstFullIdx - 1].data.outLap === true) {
        found = true;
        const x = props.laptimes
          .slice(firstFullIdx, props.laptimes.indexOf(d) + 1)
          .filter(
            (v) => v.data.lapTime >= overallAvg * (1 - rangePct) && v.data.lapTime <= overallAvg * (1 + rangePct)
          );

        const sum = x.map((v) => v.data.lapTime).reduce((a, b) => a + b, 0);
        return sum / x.length;
      } else {
        if (props.laptimes[firstFullIdx - 1].data.lapNo > 0) {
          firstFullIdx--;
        } else found = true;
      }
    }
    const x = props.laptimes
      .slice(firstFullIdx, props.laptimes.indexOf(d) + 1)
      .filter((v) => v.data.lapTime >= overallAvg * (1 - rangePct) && v.data.lapTime <= overallAvg * (1 + rangePct));

    const sum = x.map((v) => v.data.lapTime).reduce((a, b) => a + b, 0);
    return sum / x.length;
  };
  const columns: ColumnsType<ILaptimeMeta> = [
    { key: "lap", title: "Lap", dataIndex: ["data", "lapNo"], render: (d) => d },
    { key: "lapTime", title: "Time", dataIndex: ["data", "lapTime"], render: (d) => lapTimeString(d) },
    { key: "rollAvg", title: "Roll AvgTime", dataIndex: ["data"], render: (d, v) => lapTimeString(rollingAvg(v)) },
  ];
  range(maxSectors).forEach((sector) => {
    columns.push({
      key: "sector" + sector,
      title: "Sector " + (sector + 1),
      dataIndex: ["data", "sectors"],
      render: (d) => (sector < d.length ? lapTimeString(d[sector]) : ""),
    });
  });
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={props.laptimes}
      columns={columns}
      rowKey={(d) => sprintf("lt-%d", _.uniqueId())}
    />
  );
};
export default PitStops;
