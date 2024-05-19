import { Col, Select } from "antd";
import _ from "lodash";
import React from "react";
import { ICarFilterData } from "./util";

interface Props {
  availableCars: ICarFilterData[];
  availableClasses: string[];
  selectedCars: string[];
  selectedCarClasses: string[];
  selectedReferenceCar?: string;
}
interface DispatchProps {
  onSelectCarFilter: (value: string[]) => void;
  onSelectCarClassFilter: (value: any) => void;
  onSelectReferenceCar: (value: string) => void;
}
type MyProps = Props & DispatchProps;

const { Option } = Select;

const ReferenceCarFilter: React.FC<MyProps> = (props: MyProps) => {
  const availableCarsOptions = props.availableCars.map((d) => (
    <Option key={d.carNum} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  const carClassOptions = _.concat(props.availableClasses, "All").map((d) => (
    <Option key={d} value={d}>
      {d}
    </Option>
  ));

  const handleOnSelectCarFilter = (value: any) => {
    props.onSelectCarFilter(value as string[]);
  };
  const handleOnSelectCarClassFilter = (value: any) => {
    props.onSelectCarClassFilter(value as string[]);
  };
  const handleOnSelectReferenceCar = (value: string) => {
    props.onSelectReferenceCar(value);
  };
  // console.log("Dings");
  return (
    <>
      <Col span={4}>
        <Select
          style={{ width: "100%" }}
          allowClear
          value={props.selectedReferenceCar}
          placeholder="Select reference car"
          onChange={handleOnSelectReferenceCar}
          maxTagCount="responsive"
        >
          {availableCarsOptions}
        </Select>
      </Col>
      <Col span={10}>
        <Select
          style={{ width: "100%" }}
          mode="tags"
          allowClear
          value={props.selectedCars}
          placeholder="Select cars to show"
          onChange={handleOnSelectCarFilter}
          maxTagCount="responsive"
        >
          {availableCarsOptions}
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
export default ReferenceCarFilter;
