import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";
import { updateAvailableStandingsColumns as availableStandingsColumns } from "../stores/basedata/actions";
import { classificationSettings } from "../stores/ui/actions";
import { lapTimeString } from "../utils/output";

interface MyProps {
  showCars: string[];
}
interface DispatchProps {}

type Props = MyProps & DispatchProps;

export const Standings: React.FC<Props> = (props: Props) => {
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.classification);
  const stateColumnsAvail = useSelector((state: ApplicationState) => state.baseData.availableStandingsColumns);
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const dispatch = useDispatch();
  const getValue = (d: [], key: string) => getValueViaSpec(d, stateCarManifest, key);

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
      return v > 0 ? lapTimeString(v) : "";
    }
  };

  const nullAwareOutput = (value: any, format: string): string => {
    if (typeof value === "number") {
      return sprintf(format, value);
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
  const columns: ColumnsType<{}> = [
    { key: "pos", title: "Pos", render: (d) => getValue(d, "pos"), width: 20, align: "right" },
    { key: "pic", title: "PIC", render: (d) => getValue(d, "pic"), width: 20, align: "right" },
    { key: "carNum", title: "#", render: (d) => getValue(d, "carNum"), width: 20, align: "right" },
    { key: "car", title: "Car", render: (d) => getValue(d, "car") },
    { key: "carClass", title: "Class", render: (d) => getValue(d, "carClass"), ellipsis: false },
    { key: "state", title: "State", render: (d) => getValue(d, "state") },
    { key: "userName", title: "Driver", render: (d) => getValue(d, "userName"), ellipsis: false },
    { key: "laps", title: "Lap", render: (d) => lapsOutput(d), width: 20, align: "right" },
    { key: "last", title: "Last", render: (d) => coloredTimeData(d, "last"), width: 60, align: "right" },
    {
      key: "best",
      title: "Best",
      render: (d) => {
        const v = getValue(d, "best");
        return v > 0 ? lapTimeString(v) : "";
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
    { key: "gap", title: "Gap", render: (d) => nullAwareOutput(getValue(d, "gap"), "%.1f"), width: 20, align: "right" },
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
  stateCarManifest
    .filter((v) => /^s\d+$/.test(v.name))
    .forEach((v) =>
      columns.push({
        key: v.name,
        title: v.name.toLocaleUpperCase(),
        render: (d) => coloredTimeData(d, v.name),
        width: 45,
        align: "right",
      })
    );
  // console.log(data);
  // className="istint-compact"

  const cars = carsRaw.filter((c: any) => props.showCars.includes(getValue(c, "carNum")));
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
  if (!stateColumnsAvail.length) {
    const updateData = columns.map((c) => ({ name: c.key! as string, title: c.title as string }));
    dispatch(availableStandingsColumns(updateData));
    dispatch(classificationSettings({ ...uiSettings, showCols: updateData }));
  }
  const filteredColumns = columns.filter((c) => uiSettings.showCols.map((sc) => sc.name).includes(c.key as string));

  return (
    <Table
      className="iracelog-compact"
      pagination={pagination}
      columns={filteredColumns}
      dataSource={cars}
      rowKey={() => _.uniqueId()}
    />
  );
};
