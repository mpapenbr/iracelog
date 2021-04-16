import { Col, Select } from "antd";
import _ from "lodash";
import React from "react";

interface Props {
  availableClasses: string[];

  selectedCarClasses: string[];
}
interface DispatchProps {
  onSelectCarClassFilter: (value: any) => void;
}
type MyProps = Props & DispatchProps;

const { Option } = Select;

const CarClassFilter: React.FC<MyProps> = (props: MyProps) => {
  const carClassOptions = props.availableClasses.map((d) => (
    <Option key={_.uniqueId()} value={d}>
      {d}
    </Option>
  ));

  const handleOnSelectCarClassFilter = (value: any) => {
    props.onSelectCarClassFilter(value as string[]);
  };
  return (
    <>
      {props.availableClasses.length > -1 ? (
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            allowClear
            mode="tags"
            placeholder="Car class filter"
            value={props.selectedCarClasses}
            onChange={handleOnSelectCarClassFilter}
          >
            {carClassOptions}
          </Select>
        </Col>
      ) : (
        <></>
      )}
    </>
  );
};
export default CarClassFilter;
