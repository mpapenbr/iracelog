import { AuthService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/auth/v1/auth_service_pb";
import { Col, Row } from "antd";
import React from "react";
import { UserAuthComponent } from "../components/auth/userAuth";
import { LatestEvents } from "../components/events/latestEvents";
import { LatestEventsGrpc } from "../components/events/latestEventsGrpc";
import { LiveEvents } from "../components/events/liveEventsGrpc";
import { SimpleSearchEvents } from "../components/events/simpleSearchEvents";
import { API_GRAPHQL_ENABLED } from "../constants";
import { useAppDispatch, useAppSelector } from "../stores";
import { resetUserInfo } from "../stores/grpc/slices/userInfoSlice";
import { useClient } from "../utils/useClient";

export const Events: React.FC = () => {
  const serverSettings = useAppSelector((state) => state.serverSettings);
  const cbAuthClient = useClient(AuthService);
  const dispatch = useAppDispatch();
  const onLogin = () => {
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
  };
  const onLogout = () => {
    // Implement logout logic here
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
  };
  return (
    <>
      {serverSettings.supportsLogins === true ? (
        <Row gutter={16}>
          <Col span={24}>
            <UserAuthComponent onLogin={onLogin} onLogout={onLogout} />
          </Col>
        </Row>
      ) : (
        <></>
      )}
      <Row gutter={16}>
        <Col span={12}>
          {/* <LatestEventsGrpc /> */}
          {API_GRAPHQL_ENABLED === true ? <LatestEvents /> : <LatestEventsGrpc />}
        </Col>

        <Col span={12}>
          <Row>
            <Col span={24}>
              <LiveEvents />
            </Col>
          </Row>
          {API_GRAPHQL_ENABLED === true ? (
            <Row>
              <Col span={24}>
                <SimpleSearchEvents />
              </Col>
            </Row>
          ) : (
            <></>
          )}
          {/* {serverSettings.supportsLogins === true ? (
            <Row>
              <Col span={24}>
                <DemoLogin />
              </Col>
            </Row>
          ) : (
            <></>
          )} */}
          {/* <Row>
          <Col span={24}>
            <DebugSession />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DebugClassification />
          </Col>
        </Row> */}
        </Col>
      </Row>
    </>
  );
};
