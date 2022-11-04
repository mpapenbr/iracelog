import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Col, Row, Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { messagesSettings } from "../../stores/ui/actions";

interface IInfoMsgData {
  timestamp: Date;
  type: string;
  carClass: string;
  msg: string;
}
const RaceMessages: React.FC = () => {
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.messages);
  const infoMsgRaw = useSelector((state: ApplicationState) => state.raceData.infoMessages);
  const messageManifest = useSelector(
    (state: ApplicationState) => state.raceData.manifests.message,
  );
  const dispatch = useDispatch();
  // each entry in infoMsgRaw is an array with messages, which needs to be flatten for the list
  const data = [...infoMsgRaw].reverse().reduce((work, current) => {
    return work.concat(
      current.data.map((v: any) => ({
        timestamp: new Date(current.timestamp * 1000),
        type: getValueViaSpec(v, messageManifest, "type"),
        carClass: getValueViaSpec(v, messageManifest, "carClass"),
        msg: getValueViaSpec(v, messageManifest, "msg"),
      })),
    );
  }, []);
  const filterValuesType = Array.from(
    data.reduce((prev, cur: IInfoMsgData) => prev.add(cur.type), new Set<string>()).values(),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((s) => ({ text: s, value: s }));
  const filterValuesCarClass = Array.from(
    data
      .reduce(
        (prev, cur: IInfoMsgData) => (cur.carClass ? prev.add(cur.carClass) : prev),
        new Set<string>(),
      )
      .values(),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((s) => ({ text: s, value: s }));

  const columns: ColumnsType<IInfoMsgData> = [
    {
      key: "timestamp",
      title: "Time",
      dataIndex: "timestamp",
      render: (d: Date) => d.toLocaleTimeString(),
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      filters: filterValuesType,
      onFilter: (v, r) => r.type === v,
    },
    {
      key: "carClass",
      title: "CarClass",
      dataIndex: "carClass",
      filters: filterValuesCarClass,
      onFilter: (v, r) => r.carClass === v,
    },
    { key: "msg", title: "Message", dataIndex: "msg" },
  ];
  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);

      dispatch(messagesSettings({ pageSize: newPageSize }));
    },
    showSizeChanger: true,
  };
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Table
          columns={columns}
          className="iracelog-compact"
          pagination={pagination}
          dataSource={data}
          rowKey={() => _.uniqueId()}
        />
      </Col>
    </Row>
  );
};

export default RaceMessages;
