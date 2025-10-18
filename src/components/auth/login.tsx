import { AuthService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/auth/v1/auth_service_pb";
import { ProviderService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/provider/v1/provider_service_pb";
import { UserService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/user/v1/user_service_pb";
import { Code } from "@connectrpc/connect";
import { Button, Descriptions, Empty, Form, Space } from "antd";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../stores";
import { resetUserInfo, updateUserInfo } from "../../stores/grpc/slices/userInfoSlice";
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
  const serverSettings = useAppSelector((state) => state.serverSettings);
  const userInfo = useAppSelector((state) => state.userInfo);
  const cbAuthClient = useClient(AuthService);
  const cbProviderClient = useClient(ProviderService);
  const cbUserClient = useClient(UserService);
  const [form] = Form.useForm();
  let pingCount = 0;
  if (serverSettings.supportsLogins === false) {
    return <div>Login not supported by server</div>;
  }
  const onLoginClicked = (values: any) => {
    console.log("Login clicked");
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
    console.log("Logout clicked");
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
        dispatch(resetUserInfo());
        // window.location.href = res.logoutUrl;

        // setData({ events: res.getEventsList() });
      },
    );
    // dispatch(loginUser({ username: values.username, password: values.password }));
  };
  const onUserInfoClicked = (values: any) => {
    console.log("User info clicked");
    cbUserClient.getUserInfo({}, (err, res) => {
      if (err != undefined) {
        if (err.code === Code.Unauthenticated) {
          // not logged in
          dispatch(resetUserInfo());
          return;
        }
        console.log("getUserInfo error", err);
        return;
      }
      console.log("getUserInfo called", res);
      dispatch(updateUserInfo(res.userInfo!));
    });
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
        <Button onClick={onUserInfoClicked}>User info</Button>
      </Space.Compact>
      <Space.Compact block>
        {userInfo.loggedIn ? (
          <Descriptions title="Demo User" column={1} size="small">
            <Descriptions.Item label="User ID">{userInfo.info.userId}</Descriptions.Item>
            <Descriptions.Item label="Username">{userInfo.info.username}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="Not logged in" />
        )}
      </Space.Compact>
    </>
  );
};
