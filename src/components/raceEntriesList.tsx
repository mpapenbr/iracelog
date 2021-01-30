import { Spin, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ApplicationState } from "../stores";
import { IDriverMeta } from "../stores/drivers/types";
import { ensureEventData } from "../stores/raceevents/actions";
import { IRaceContainer } from "../stores/raceevents/types";
import { adjustRawNumber } from "../utils/output";
import { collectCarClasses, collectCars, extractRaceUUID, teamDrivers } from "./util/common";

interface IStateProps {
  raceContainer: IRaceContainer;
  autoDetect?: boolean;
  showColums?: string[];
  extraButtons?: (carIdx: number) => JSX.Element;
  tableProps?: any;
}
interface IDispatchProps {
  // deleteEvent: (id: string) => any;
}

type MyProps = IStateProps & IDispatchProps;

interface IKey {
  key: string;
}

function removeCols(current: IKey[], removeKeys: string[]): IKey[] {
  return current.reduce((a, b) => {
    removeKeys.forEach((k) => {
      if (b.key === k) {
        a.splice(a.indexOf(b), 1);
      }
    });
    return a;
  }, current);
}

function keepCols(current: IKey[], keepKeys: string[]): IKey[] {
  return current.reduce((a, b) => {
    if (keepKeys.indexOf(b.key) === -1) {
      a.splice(a.indexOf(b), 1);
    }
    return a;
  }, current);
}

/**
 * shows entries for a race. Columns can be set manually or we can let this method detect which columns are useful.
 *
 * @param props
 */
const RaceEntriesList: React.FC<MyProps> = (props: MyProps) => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const myId = extractRaceUUID(location.pathname);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  }, [loadTrigger]);
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  if (!raceContainer.loaded) {
    return <Spin />;
  }

  const drivers = raceContainer.drivers.reduce((prev: IDriverMeta[], current: IDriverMeta) => {
    if (prev.findIndex((v) => v.data.carIdx === current.data.carIdx) == -1) {
      prev.push(current);
    }
    return prev;
  }, []);
  const rawColumns: ColumnsType<IDriverMeta> = [
    { key: "carIdx", title: "CarIdx", dataIndex: ["data", "carIdx"], sorter: (a, b) => a.data.carIdx - b.data.carIdx },
    {
      key: "carNo",
      title: "#",
      align: "right",
      dataIndex: ["data", "carNumberRaw"],
      render: (d) => adjustRawNumber(d),
      sorter: (a, b) => a.data.carNumber - b.data.carNumber,
    },
    {
      key: "driverName",
      title: "Driver",
      render: (d) => d.data.userName,
      sorter: (a, b) => a.data.userName.localeCompare(b.data.userName),
    },
    {
      key: "teamName",
      title: "Team",
      render: (d) => (
        <Tooltip
          title={teamDrivers(d.data.carIdx, props.raceContainer).map((n) => (
            <p key={_.uniqueId()}>{n}</p>
          ))}
        >
          {d.data.teamName}
        </Tooltip>
      ),
      sorter: (a, b) => a.data.teamName.localeCompare(b.data.teamName),
    },
    {
      key: "carClass",
      title: "Class",
      render: (d) => d.data.carClassShortName,
      sorter: (a, b) => a.data.carClassShortName.localeCompare(b.data.carClassShortName),
      filters: collectCarClasses(raceContainer.drivers).map((v) => ({ text: v.name, value: v.id })),
      onFilter: (value, record: IDriverMeta) => record.data.carClassId === (value as number),
    },
    {
      key: "carName",
      title: "Car",
      render: (d) => d.data.carName,
      sorter: (a, b) => a.data.carName.localeCompare(b.data.carName),
      filters: collectCars(raceContainer.drivers).map((v) => ({ text: v.name, value: v.id })),
      onFilter: (value, record: IDriverMeta) => record.data.carId === (value as number),
    },

    {
      key: "action",
      title: "Action",
      dataIndex: ["data", "carIdx"],
      render: (d) => (props.extraButtons ? props.extraButtons(d) : ""),
    },
  ];
  var columns = [...rawColumns];

  const autoDetect = props.autoDetect !== undefined ? props.autoDetect : props.showColums === undefined ? true : false;
  if (autoDetect) {
    columns = removeCols(columns as IKey[], ["carIdx"]);
    if (props.raceContainer.eventData.teamRacing) {
      columns = removeCols(columns as IKey[], ["driverName"]);
    } else {
      columns = removeCols(columns as IKey[], ["teamName"]);
    }
    if (collectCarClasses(props.raceContainer.drivers).length === 1) {
      columns = removeCols(columns as IKey[], ["carClass"]);
    }
    if (props.raceContainer.eventData.numCarTypes === 1) {
      columns = removeCols(columns as IKey[], ["carName"]);
    }
  }
  if (props.showColums !== undefined) {
    columns = keepCols(columns as IKey[], props.showColums);
  }
  if (props.extraButtons === undefined) {
    columns = removeCols(columns as IKey[], ["action"]);
  }
  return (
    <Table
      {...props.tableProps}
      dataSource={drivers}
      columns={columns}
      pagination={false}
      rowKey={(d) => _.uniqueId()}
    />
  );
};
export default RaceEntriesList;
