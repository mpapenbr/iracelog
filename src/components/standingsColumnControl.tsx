import { Empty, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { Key } from "react";
import { useAppDispatch, useAppSelector } from "../stores";

import { IColumnInfo } from "../stores/grpc/slices/types";
import { updateClassification } from "../stores/grpc/slices/userSettingsSlice";

const StandingsColumnControlTable: React.FC = () => {
  const allCols = useAppSelector((state) => state.userSettings.standingsColumns);
  const uiSettings = useAppSelector((state) => state.userSettings.classification);
  const selCols = uiSettings.showCols;
  const dispatch = useAppDispatch();
  const onSelectChange = (selectedRowKeys: Key[]) => {
    // console.log(selectedRowKeys);
    // console.log(selectedRows);
    dispatch(
      updateClassification({
        ...uiSettings,
        showCols: allCols.availableColumns.filter((c) => selectedRowKeys.includes(c.name)),
      }),
    );
  };
  const rowSelection = {
    selectedRowKeys: selCols.map((c) => c.name),
    selections: [Table.SELECTION_ALL, Table.SELECTION_NONE, Table.SELECTION_INVERT],
    onChange: onSelectChange,
  };
  const columns: ColumnsType<IColumnInfo> = [{ key: "name", title: "Column", dataIndex: "title" }];
  return allCols.availableColumns.length > 0 ? (
    <>
      <Table
        className="iracelog-standings-select-cols"
        pagination={false}
        rowSelection={rowSelection}
        // size="small"
        columns={columns}
        dataSource={allCols.availableColumns}
        rowKey={(item) => item.name}
      />
    </>
  ) : (
    <Empty description="No data available" />
  );
};

const StandingsColumnControl = StandingsColumnControlTable;
export default StandingsColumnControl;
