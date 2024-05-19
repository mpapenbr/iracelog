import { Col, Select } from "antd";
import React from "react";
import { ICarFilterData } from "./util";

interface Props {
  availableCars: ICarFilterData[];
  availableClasses: string[];
  selectedCar?: string;
  selectedCarClasses: string[];
}
interface DispatchProps {
  onSelectCarFilter: (value: string) => void;
  onSelectCarClassFilter: (value: any) => void;
}
type MyProps = Props & DispatchProps;

const { Option } = Select;

const SingleSelectCarFilter: React.FC<MyProps> = (props: MyProps) => {
  const referenceOptions = props.availableCars.map((d) => (
    <Option key={d.carNum} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  const carClassOptions = props.availableClasses.map((d) => (
    <Option key={d} value={d}>
      {d}
    </Option>
  ));

  const handleOnSelectCarFilter = (value: any) => {
    props.onSelectCarFilter(value as string);
  };
  const handleOnSelectCarClassFilter = (value: any) => {
    props.onSelectCarClassFilter(value as string[]);
  };
  // console.log("Dings");
  return (
    <>
      <Col span={10}>
        <Select
          style={{ width: "100%" }}
          allowClear
          value={props.selectedCar}
          placeholder="Select car"
          onChange={handleOnSelectCarFilter}
          maxTagCount="responsive"
        >
          {referenceOptions}
        </Select>
      </Col>
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
export default SingleSelectCarFilter;
