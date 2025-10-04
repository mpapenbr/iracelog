import { AuthService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/auth/v1/auth_service_pb";
import { ProviderService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/provider/v1/provider_service_pb";
import { Button, Descriptions, Form, Space } from "antd";
import React from "react";
import { useAppDispatch } from "../../stores";
import { useClient } from "../../utils/useClient";

const layout = {
  labelCol: { span: 10 },
  // wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
export const DemoLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const cbAuthClient = useClient(AuthService);
  const cbProviderClient = useClient(ProviderService);
  const [form] = Form.useForm();
  let pingCount = 0;
  const onLoginClicked = (values: any) => {
    console.log("Login clicked", values);
    cbAuthClient.login(
      {
        // { externalId: globalWamp.backendConfig.tenant.id },
        // redirectUrl: window.location.href,
        redirectUrl: window.location.href,
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("login called", res);
        window.location.href = res.loginUrl;
        // setData({ events: res.getEventsList() });
      },
    );
    // dispatch(loginUser({ username: values.username, password: values.password }));
  };
  const onLogoutClicked = (values: any) => {
    console.log("Logout clicked", values);
    cbAuthClient.logout(
      {
        // { externalId: globalWamp.backendConfig.tenant.id },
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("logout called", res);

        // setData({ events: res.getEventsList() });
      },
    );
    // dispatch(loginUser({ username: values.username, password: values.password }));
  };
  const onPingClicked = (values: any) => {
    console.log("Ping clicked", values);
    cbProviderClient.ping(
      {
        num: pingCount++,
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("ping called", res);

        // setData({ events: res.getEventsList() });
      },
    );
    // dispatch(loginUser({ username: values.username, password: values.password }));
  };
  return (
    <>
      <Space.Compact block>
        <Button onClick={onLoginClicked}>Login</Button>
        <Button onClick={onLogoutClicked}>Logout</Button>
        <Button onClick={onPingClicked}>Ping</Button>
      </Space.Compact>
      <Space.Compact block>
        <Descriptions title="Demo User" column={1} size="small">
          <Descriptions.Item label="Username">tdb</Descriptions.Item>
        </Descriptions>
      </Space.Compact>
    </>
  );
};
