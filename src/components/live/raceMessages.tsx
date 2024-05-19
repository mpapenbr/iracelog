import {
  MessageSubType,
  MessageType,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/racestate/v1/racestate_pb";
import { Col, Row, Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../stores";
import { MessageExt } from "../../stores/grpc/slices/messagesSlice";
import { updateMessages } from "../../stores/grpc/slices/userSettingsSlice";

const RaceMessages: React.FC = () => {
  const uiSettings = useAppSelector((state) => state.userSettings.messages);
  const infoMsgRaw = useAppSelector((state) => state.infoMessages.messages);

  const dispatch = useAppDispatch();

  const resolveMessageType = (m: MessageType): string => {
    switch (m) {
      case MessageType.TIMING:
        return "Timing";
      case MessageType.PITS:
        return "Pits";
      default:
        return "";
    }
  };
  const resolveMessageSubType = (m: MessageSubType): string => {
    switch (m) {
      case MessageSubType.RACE_CONTROL:
        return "Race control";
      case MessageSubType.DRIVER:
        return "Driver";
      default:
        return "";
    }
  };
  const data = [...infoMsgRaw].reverse();
  const filterValuesType = Array.from(
    data
      .reduce((prev, cur: MessageExt) => prev.add(cur.message.type), new Set<MessageType>())
      .values(),
  )
    .sort((a, b) => resolveMessageType(a).localeCompare(resolveMessageType(b)))
    .map((s) => ({ text: resolveMessageType(s), value: s }));
  const filterValuesCarClass = Array.from(
    data
      .reduce(
        (prev, cur: MessageExt) => (cur.message.carClass ? prev.add(cur.message.carClass) : prev),
        new Set<string>(),
      )
      .values(),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((s) => ({ text: s, value: s }));

  const columns: ColumnsType<MessageExt> = [
    {
      key: "timestamp",
      title: "Time",
      dataIndex: "timestamp",
      render: (d: Date) => d.toLocaleTimeString(),
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "message",
      filters: filterValuesType,
      onFilter: (v, r) => r.message.type === v,
      render: (d) => resolveMessageType(d.type),
    },
    {
      key: "carClass",
      title: "CarClass",
      dataIndex: "message",
      filters: filterValuesCarClass,
      render: (d) => d.carClass,
      onFilter: (v, r) => r.message.carClass === v,
    },
    { key: "msg", title: "Message", dataIndex: "message", render: (d) => d.msg },
  ];
  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);

      dispatch(updateMessages({ pageSize: newPageSize }));
    },
    showSizeChanger: true,
  };
  return (
    <Row gutter={16}>
      <Col span={18}>
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
