import { Table, TablePaginationConfig, theme } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { useAppDispatch, useAppSelector } from "../stores";

import { Driver } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_occupancy_pb";
import {
  Car,
  CarState,
  TimeMarker,
  TimeWithMarker,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_pb";

import {
  toggleHighlightCar,
  updateClassification,
  updateStandingColumns,
} from "../stores/grpc/slices/userSettingsSlice";
import { iRacingCarDataLookup } from "../utils/cardata";
import { lapTimeString } from "../utils/output";
import { findDriverBySessionTimeGrpc } from "./live/util";

interface MyProps {
  showCars: string[];
}
const { useToken } = theme;
type Props = MyProps;

export const Standings: React.FC<Props> = (props: Props) => {
  const uiSettings = useAppSelector((state) => state.userSettings.classification);
  const globalSettings = useAppSelector((state) => state.userSettings.global);
  const stateColumnsAvail = useAppSelector((state) => state.userSettings.standingsColumns);
  const eventInfo = useAppSelector((state) => state.eventInfo);
  const sessionInfo = useAppSelector((state) => state.session);
  const classification = useAppSelector((state) => state.classification);
  const availableCars = useAppSelector((state) => state.availableCars);
  const carInfo = useAppSelector((state) => state.carInfos);
  const carOcc = useAppSelector((state) => state.carOccupancies);
  const carEntries = useAppSelector((state) => state.carEntries);
  const carClasses = useAppSelector((state) => state.carClasses);

  const dispatch = useAppDispatch();
  const { token } = useToken();

  const entryByIdx = Object.assign({}, ...availableCars.map((x) => ({ [x.carIdx]: x.carNum })));

  // console.log(entryByIdx);

  const coloredTimeData = (d: TimeWithMarker) => {
    if (!d) {
      return "n.a";
    }
    const v = d.time;
    if (v < 0) {
      return "";
    }

    switch (d.marker) {
      case TimeMarker.OLD_VALUE:
        return <span style={{ color: token.colorTextDisabled }}>{lapTimeString(v)}</span>;
      case TimeMarker.OVERALL_BEST:
        return <span style={{ color: "darkorchid", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      case TimeMarker.PERSONAL_BEST:
        return <span style={{ color: "green", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      case TimeMarker.CLASS_BEST:
        return <span style={{ color: "OrangeRed", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      case TimeMarker.CAR_BEST:
        return <span style={{ color: "dodgerblue", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      default:
        return lapTimeString(v);
    }
  };
  const resolveState = (s: CarState) => {
    switch (s) {
      case CarState.UNSPECIFIED:
        return "";
      case CarState.INIT:
        return "INIT";
      case CarState.RUN:
        return "RUN";
      case CarState.PIT:
        return "PIT";
      case CarState.SLOW:
        return "SLOW";
      case CarState.FIN:
        return "FIN";
      case CarState.OUT:
        return "OUT";
      default:
        "";
    }
  };
  const carIdxLookup = entryByIdx;
  const getCarNumByIdx = (c: any): string => {
    return carIdxLookup[c.carIdx] ?? "n.a.";
  };
  const getCarNum = getCarNumByIdx;

  const sessionTime = sessionInfo.session.sessionTime;

  // key: carNum
  const carOccLookup = Object.assign({}, ...carOcc.map((v) => ({ [v.carNum]: v })));
  const carEntryLookup = Object.assign(
    {},
    ...carEntries.map((v) => ({ [v.car?.carNumber!]: v.car })),
  );
  const carClassLookup = Object.assign({}, ...carClasses.map((v) => ({ [v.id]: v })));
  const carInfoLookup = Object.assign({}, ...carInfo.map((v) => ({ [v.carId]: v })));

  // const carDataLookup = new Map<string, ICarEntry>(carInfo.map((o) => [o.car.carNumber, o.car]));
  // const carClassLookup = new Map<number, ICarClass>(carData.carClasses.map((o) => [o.id, o]));

  const resolveCarDriver = (carNum: string): Driver | undefined => {
    if (carOccLookup[carNum] === undefined) {
      console.log("carInfoLookup: ", carOccLookup);
    }
    // return carOccLookup[carNum]!;
    // TODO: reactivate
    return findDriverBySessionTimeGrpc(carOccLookup[carNum]!, sessionTime);
  };

  const getDriverName = (carNum: string): string => {
    const x = resolveCarDriver(carNum);
    return x?.name ?? "n.a";
  };
  const getCarClassName = (carNum: string): string => {
    const classId = carEntryLookup[carNum]?.carClassId;
    return classId ? (carClassLookup[classId]?.name ?? "n.a.") : "n.a.";
  };
  const getCarName = (carNum: string): string => {
    const carId = carEntryLookup[carNum]?.carId;
    return carId
      ? (iRacingCarDataLookup.get(carId)?.abbrev ?? carInfoLookup[carId]?.nameShort ?? "n.a.")
      : "n.a.";
  };

  const nullAwareOutput = (value: any, format: string): string => {
    if (typeof value === "number") {
      return sprintf(format, value);
    } else return "";
  };

  const tireCompound = (d: Car): string => {
    if (d.tireCompound) {
      const carId = carEntryLookup[getCarNum(d)]?.carId as number;
      const carInfo = carInfoLookup[carId];
      if (carInfo === undefined) {
        return "";
      }
      switch (carId) {
        case 99: // Dallara IR 18
          return d.tireCompound.rawValue == 0 ? "P" : "A"; // primary:0, alternate: 1

        case 71: // McLaren MP4-30
        case 145: // F1 Merc 12
        case 161: // F1 Merc 13
          switch (d.tireCompound.rawValue) {
            case 0:
              return "S"; // soft
            case 1:
              return "M"; // medium
            case 2:
              return "H"; // hard
            default:
              return "";
          }
          break;
        default:
          return d.tireCompound.rawValue == 0 ? "D" : "W";
      }
    } else return "";
  };
  const lapsOutput = (d: Car) => {
    if (d.state == CarState.OUT) {
      // console.log(getValue(d, "lc"));
      return d.lc;
    } else return d.lap;
  };

  const trackPosGraph = (d: any) => {
    const pos = d * 100 + "%";
    return (
      <svg width="80px" height="12">
        <rect x={0} y={0} width="100%" height="100%" style={{ stroke: "grey", fillOpacity: 0 }} />
        <rect x={pos} y={0} width={2} height="100%" style={{ fill: token.colorTextBase }} />
      </svg>
    );
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<Car> = [
    { key: "pos", title: "Pos", render: (d: Car) => d.pos, width: 20, align: "right" },
    { key: "pic", title: "PIC", render: (d: Car) => d.pic, width: 20, align: "right" },

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
        return getCarName(getCarNum(d));
      },
    },
    {
      key: "carClass",
      title: "Class",
      render: (d) => getCarClassName(getCarNum(d)),
      ellipsis: false,
    },
    { key: "state", title: "State", render: (d) => resolveState(d.state) },
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
      render: (d) => coloredTimeData(d.last),
      width: 60,
      align: "right",
    },
    {
      key: "best",
      title: "Best",
      render: (d) => {
        // const v = getValue(d, "best");
        // return v > 0 ? lapTimeString(v) : "";
        return coloredTimeData(d.best);
      },
      width: 60,
      align: "right",
    },
    // { key: "trackPos", title: "CurPos", render: (d) => nullAwareOutput(getValue(d, "trackPos"), "%.4f") },
    {
      key: "trackPos2",
      title: "TrackPos",
      render: (d) => trackPosGraph(d.trackPos),
      width: 85,
      align: "center",
    },
    {
      key: "dist",
      title: "Dist",
      render: (d) => nullAwareOutput(d.dist, "%.0f"),
      width: 20,
      align: "right",
    },
    {
      key: "gap",
      title: "Gap",
      render: (d) => nullAwareOutput(d.gap, "%.1f"),
      width: 20,
      align: "right",
    },
    {
      key: "interval",
      title: "Int",
      render: (d) => nullAwareOutput(d.interval, "%.1f"),
      width: 20,
      align: "right",
    },
    {
      key: "speed",
      title: "Speed",
      render: (d) => nullAwareOutput(d.speed, "%.0f"),
      width: 30,
      align: "right",
    },
    {
      key: "stintLap",
      title: "SL",
      render: (d) => nullAwareOutput(d.stintLap, "%.0f"),
      width: 30,
      align: "right",
    },
    {
      key: "pitstops",
      title: "PIT",
      render: (d) => nullAwareOutput(d.pitstops, "%.0f"),
      width: 30,
      align: "right",
    },
    {
      key: "tireCompound",
      title: "T",
      render: (d) => tireCompound(d),
      width: 30,
      align: "right",
    },
  ];
  eventInfo.track.sectors.forEach((v, i) => {
    columns.push({
      key: "s" + (i + 1),
      title: "S" + (i + 1),
      render: (d) => coloredTimeData(d.sectors[i]),
      width: 45,
      align: "right",
    });
  });

  // if (stateCarManifest.findIndex((v) => v.name === "stintLap") > -1) {
  //   columns.push({
  //     key: "stintLap",
  //     title: "SL",
  //     render: (d) => nullAwareOutput(getValue(d, "stintLap"), "%.0f"),
  //     width: 30,
  //     align: "right",
  //   });
  // }
  // if (stateCarManifest.findIndex((v) => v.name === "pitstops") > -1) {
  //   columns.push({
  //     key: "pitstops",
  //     title: "PIT",
  //     render: (d) => nullAwareOutput(getValue(d, "pitstops"), "%.0f"),
  //     width: 20,
  //     align: "right",
  //   });
  // }
  // if (stateCarManifest.findIndex((v) => v.name === "tireCompound") > -1) {
  //   columns.push({
  //     key: "tireCompound",
  //     title: "T",
  //     render: (d) => tireCompound(getValue(d, "tireCompound")),
  //     width: 20,
  //     align: "right",
  //   });
  // }

  // stateCarManifest
  //   .filter((v) => /^s\d+$/.test(v.name))
  //   .forEach((v) =>
  //     columns.push({
  //       key: v.name,
  //       title: v.name.toLocaleUpperCase(),
  //       render: (d) => coloredTimeData(d, v.name),
  //       width: 45,
  //       align: "right",
  //     }),
  //   );
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

  const cars = classification.filter((c) => props.showCars.includes(getCarNum(c)));
  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);
      // dispatch(uiClassificationSettings({ ...uiSettings, pageSize: newPageSize }));
      dispatch(updateClassification({ ...uiSettings, pageSize: newPageSize }));
    },
    showSizeChanger: true,
  };
  if (stateColumnsAvail.availableColumns.length != columns.length) {
    const updateData = columns.map((c) => ({ name: c.key! as string, title: c.title as string }));
    dispatch(updateStandingColumns({ availableColumns: updateData }));
    dispatch(updateClassification({ ...uiSettings, showCols: updateData }));
  }
  const filteredColumns = columns.filter((c) =>
    uiSettings.showCols.map((sc) => sc.name).includes(c.key as string),
  );
  const computeClassName = (c: Car): string => {
    return sprintf(
      "standings-%s-%s %s",
      globalSettings.theme,
      resolveState(c.state)?.toLowerCase(),
      globalSettings.highlightCars.includes(getCarNum(c)) ? "standings-selected" : "",
    );
  };
  return (
    <Table
      className="iracelog-standings"
      pagination={pagination}
      columns={filteredColumns}
      dataSource={cars}
      rowKey={() => _.uniqueId()}
      onRow={(data: Car, rowIdx?: number) => ({
        className: computeClassName(data),
        onClick: () => {
          dispatch(toggleHighlightCar(getCarNum(data)));
        },
      })}
    />
  );
};
