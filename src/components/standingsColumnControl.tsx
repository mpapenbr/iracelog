import { Empty, List, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { Key } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../stores";
import { classificationSettings } from "../stores/ui/actions";
import { IColumnInfo } from "../stores/ui/types";

const StandingsColumnControlList: React.FC = () => {
  const allCols = useSelector((state: ApplicationState) => state.baseData.availableStandingsColumns);

  console.log(allCols);
  return allCols.length > 0 ? (
    <>
      <List size="small" dataSource={allCols} renderItem={(item) => <List.Item>{item.title}</List.Item>} />
    </>
  ) : (
    <Empty description="No data available" />
  );
};

const StandingsColumnControlTable: React.FC = () => {
  const allCols = useSelector((state: ApplicationState) => state.baseData.availableStandingsColumns);
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.classification);
  const selCols = uiSettings.showCols;
  const dispatch = useDispatch();
  const onSelectChange = (selectedRowKeys: Key[]) => {
    // console.log(selectedRowKeys);
    // console.log(selectedRows);
    dispatch(
      classificationSettings({ ...uiSettings, showCols: allCols.filter((c) => selectedRowKeys.includes(c.name)) })
    );
  };
  const rowSelection = {
    selectedRowKeys: selCols.map((c) => c.name),
    selections: [Table.SELECTION_ALL, Table.SELECTION_NONE, Table.SELECTION_INVERT],
    onChange: onSelectChange,
  };
  const columns: ColumnsType<IColumnInfo> = [{ key: "name", title: "Column", dataIndex: "title" }];
  return allCols.length > 0 ? (
    <>
      <Table
        className="iracelog-standings-select-cols"
        pagination={false}
        rowSelection={rowSelection}
        // size="small"
        columns={columns}
        dataSource={allCols}
        rowKey={(item) => item.name}
      />
    </>
  ) : (
    <Empty description="No data available" />
  );
};

const StandingsColumnControl = StandingsColumnControlTable;
export default StandingsColumnControl;
