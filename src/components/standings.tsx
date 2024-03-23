import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";

import { ICarInfo, IDriverInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { ICarClass, ICarEntry } from "../stores/cars/types";
import { classificationSettings, updateAvailableStandingsColumns } from "../stores/ui/actions";
import { lapTimeString } from "../utils/output";
import { carNumberByCarIdx, findDriverBySessionTime, supportsCarData } from "./live/util";

interface MyProps {
  showCars: string[];
}

type Props = MyProps;

export const Standings: React.FC<Props> = (props: Props) => {
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.classification);
  const stateColumnsAvail = useSelector(
    (state: ApplicationState) => state.userSettings.standingsColumns,
  );
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const sessionInfo = useSelector((state: ApplicationState) => state.raceData.sessionInfo);
  const carData = useSelector((state: ApplicationState) => state.carData);
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const stateSessionManifest = useSelector(
    (state: ApplicationState) => state.raceData.manifests.session,
  );
  const dispatch = useDispatch();
  const getValue = (d: [], key: string) => getValueViaSpec(d, stateCarManifest, key);

  const entryByIdx = Object.assign(
    {},
    ...carData.entries.map((x) => ({ [x.car.carIdx]: x.car.carNumber })),
  );
  // console.log(entryByIdx);

  carsRaw.forEach((c: any) => {
    // console.log(c);
    const carNum = entryByIdx[getValue(c, "carIdx")];
    // console.log("carIdx: " + getValue(c, "carIdx") + "carNum: " + carNum);
  });

  const coloredTimeData = (d: [], key: string) => {
    const value = getValueViaSpec(d, stateCarManifest, key);
    if (typeof value === "number") {
      return value > 0 ? lapTimeString(value) : "";
    } else {
      const [v, info] = value;
      if (v < 0) return "";
      if (info === "old") {
        return <span style={{ color: "lightgrey" }}>{lapTimeString(v)}</span>;
      }
      if (info === "ob") {
        return <span style={{ color: "purple", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      if (info === "pb") {
        return <span style={{ color: "green", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      if (info === "cb") {
        return <span style={{ color: "blue", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      if (info === "clb") {
        // evtl auch deepskyblue
        return <span style={{ color: "red", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      return v > 0 ? lapTimeString(v) : "";
    }
  };

  const getCarNumLegacy = (c: any): string => {
    return getValueViaSpec(c, stateCarManifest, "carNum");
  };
  const carIdxLookup = carNumberByCarIdx(carData);
  const getCarNumByIdx = (c: any): string => {
    return carIdxLookup[getValueViaSpec(c, stateCarManifest, "carIdx")];
  };
  const getCarNum = supportsCarData(eventInfo.raceloggerVersion) ? getCarNumByIdx : getCarNumLegacy;

  const sessionTime = getValueViaSpec(sessionInfo.data, stateSessionManifest, "sessionTime");

  // key: carNum
  const carInfoLookup = new Map<string, ICarInfo>(carInfo.map((o) => [o.carNum, o]));
  const carDataLookup = new Map<string, ICarEntry>(
    carData.entries.map((o) => [o.car.carNumber, o.car]),
  );
  const carClassLookup = new Map<number, ICarClass>(carData.carClasses.map((o) => [o.id, o]));

  const resolveCarInfo = (carNum: string): IDriverInfo => {
    if (carInfoLookup.get(carNum) === undefined) {
      console.log("carInfoLookup: ", carInfoLookup);
    }
    return findDriverBySessionTime(carInfoLookup.get(carNum)!, sessionTime);
  };

  const getDriverName = (carNum: string): string => {
    return resolveCarInfo(carNum).driverName;
  };
  const getCarClassName = (carNum: string): string => {
    const classId = carDataLookup.get(carNum)?.carClassId;
    return classId ? carClassLookup.get(classId)?.name ?? "n.a." : "n.a.";
  };

  const getCarName = (carNum: string): string => {
    return carDataLookup.get(carNum)?.name ?? "n.a.";
  };

  const carIdxToCarNum = (idx: number) => entryByIdx[idx];
  const nullAwareOutput = (value: any, format: string): string => {
    if (typeof value === "number") {
      return sprintf(format, value);
    } else return "";
  };
  const tireCompound = (value: any): string => {
    if (typeof value === "number") {
      return value == 0 ? "D" : "W";
    } else return "";
  };
  const lapsOutput = (d: any) => {
    if (getValue(d, "state") === "OUT") {
      // console.log(getValue(d, "lc"));
      return getValue(d, "lc");
    } else return getValue(d, "lap");
  };

  const trackPosGraph = (d: any) => {
    const pos = d * 100 + "%";
    return (
      <svg width="80px" height="12">
        <rect x={0} y={0} width="100%" height="100%" style={{ stroke: "grey", fillOpacity: 0 }} />
        <rect x={pos} y={0} width={2} height="100%" style={{ fill: "black" }} />
      </svg>
    );
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<{}> = [
    { key: "pos", title: "Pos", render: (d) => getValue(d, "pos"), width: 20, align: "right" },
    { key: "pic", title: "PIC", render: (d) => getValue(d, "pic"), width: 20, align: "right" },

    {
      key: "carNum",
      title: "#",
      render: (d) => getCarNum(d),
      width: 20,
      align: "right",
    },
    {
      key: "car",
      title: "Car",
      render: (d) => {
        return supportsCarData(eventInfo.raceloggerVersion)
          ? getCarName(carIdxToCarNum(getValue(d, "carIdx")))
          : getValue(d, "car");
      },
    },
    {
      key: "carClass",
      title: "Class",
      render: (d) => getCarClassName(getCarNum(d)),
      ellipsis: false,
    },
    { key: "state", title: "State", render: (d) => getValue(d, "state") },
    // { key: "userName", title: "Driver", render: (d) => getValue(d, "userName"), ellipsis: false },
    {
      key: "userName",
      title: "Driver",
      render: (d) => getDriverName(getCarNum(d)),
      ellipsis: false,
    },
    { key: "laps", title: "Lap", render: (d) => lapsOutput(d), width: 20, align: "right" },
    {
      key: "last",
      title: "Last",
      render: (d) => coloredTimeData(d, "last"),
      width: 60,
      align: "right",
    },
    {
      key: "best",
      title: "Best",
      render: (d) => {
        // const v = getValue(d, "best");
        // return v > 0 ? lapTimeString(v) : "";
        return coloredTimeData(d, "best");
      },
      width: 60,
      align: "right",
    },
    // { key: "trackPos", title: "CurPos", render: (d) => nullAwareOutput(getValue(d, "trackPos"), "%.4f") },
    {
      key: "trackPos2",
      title: "TrackPos",
      render: (d) => trackPosGraph(getValue(d, "trackPos")),
      width: 85,
      align: "center",
    },
    {
      key: "dist",
      title: "Dist",
      render: (d) => nullAwareOutput(getValue(d, "dist"), "%.0f"),
      width: 20,
      align: "right",
    },
    {
      key: "gap",
      title: "Gap",
      render: (d) => nullAwareOutput(getValue(d, "gap"), "%.1f"),
      width: 20,
      align: "right",
    },
    {
      key: "interval",
      title: "Int",
      render: (d) => nullAwareOutput(getValue(d, "interval"), "%.1f"),
      width: 20,
      align: "right",
    },
    {
      key: "speed",
      title: "Speed",
      render: (d) => nullAwareOutput(getValue(d, "speed"), "%.0f"),
      width: 30,
      align: "right",
    },
  ];

  if (stateCarManifest.findIndex((v) => v.name === "stintLap") > -1) {
    columns.push({
      key: "stintLap",
      title: "SL",
      render: (d) => nullAwareOutput(getValue(d, "stintLap"), "%.0f"),
      width: 30,
      align: "right",
    });
  }
  if (stateCarManifest.findIndex((v) => v.name === "pitstops") > -1) {
    columns.push({
      key: "pitstops",
      title: "PIT",
      render: (d) => nullAwareOutput(getValue(d, "pitstops"), "%.0f"),
      width: 20,
      align: "right",
    });
  }
  if (stateCarManifest.findIndex((v) => v.name === "tireCompound") > -1) {
    columns.push({
      key: "tireCompound",
      title: "T",
      render: (d) => tireCompound(getValue(d, "tireCompound")),
      width: 20,
      align: "right",
    });
  }

  stateCarManifest
    .filter((v) => /^s\d+$/.test(v.name))
    .forEach((v) =>
      columns.push({
        key: v.name,
        title: v.name.toLocaleUpperCase(),
        render: (d) => coloredTimeData(d, v.name),
        width: 45,
        align: "right",
      }),
    );
  // console.log(data);
  // className="istint-compact"

  // remove carClass column if there are no car classes
  if (carClasses.length <= 1) {
    var idx = columns.findIndex((c) => c.key === "carClass");
    if (idx != -1) {
      columns.splice(idx, 1);
    }
    idx = columns.findIndex((c) => c.key === "pic");
    if (idx != -1) {
      columns.splice(idx, 1);
    }
  }

  const cars = carsRaw.filter((c: any) => props.showCars.includes(getCarNum(c)));
  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);
      // dispatch(uiClassificationSettings({ ...uiSettings, pageSize: newPageSize }));
      dispatch(classificationSettings({ ...uiSettings, pageSize: newPageSize }));
    },
    showSizeChanger: true,
  };
  if (stateColumnsAvail.availableColumns.length != columns.length) {
    const updateData = columns.map((c) => ({ name: c.key! as string, title: c.title as string }));
    dispatch(updateAvailableStandingsColumns({ availableColumns: updateData }));
    dispatch(classificationSettings({ ...uiSettings, showCols: updateData }));
  }
  const filteredColumns = columns.filter((c) =>
    uiSettings.showCols.map((sc) => sc.name).includes(c.key as string),
  );

  return (
    <Table
      className="iracelog-standings"
      pagination={pagination}
      columns={filteredColumns}
      dataSource={cars}
      rowKey={() => _.uniqueId()}
      onRow={(data: any, num) => ({
        className: "standings-" + getValue(data, "state")?.toLowerCase(),
      })}
    />
  );
};
