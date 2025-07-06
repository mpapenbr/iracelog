import { Button, Form, Input, Space } from "antd";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../stores";
import { updateAddress } from "../../stores/grpc/slices/raceloggerSettingsSlice";

const layout = {
  labelCol: { span: 10 },
  // wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
export const RaceloggerSettings: React.FC = () => {
  const rlSettings = useAppSelector((state) => state.raceloggerSettings);
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();

  const onFinish = () => {
    dispatch(updateAddress(form.getFieldValue("address") as string));
  };

  return (
    <Space.Compact block>
      <Form
        {...layout}
        form={form}
        layout="inline"
        name="racelogger-server-settings"
        onFinish={onFinish}
        style={{ maxWidth: 600, width: "100%" }}
      >
        <Form.Item
          name="address"
          label="Racelogger Address"
          tooltip="The address of the Racelogger server. If the address is changed please reload this page."
          initialValue={rlSettings.url}
          style={{ marginBottom: 0 }}
        >
          <Input />
        </Form.Item>
        <Form.Item noStyle>
          <Button htmlType="submit" type="primary">
            Update
          </Button>
        </Form.Item>
      </Form>
    </Space.Compact>
  );
};
