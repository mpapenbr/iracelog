import { Spin, Statistic } from "antd";
import autobahn, { Session } from "autobahn";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_CROSSBAR_URL } from "../constants";
import { ApplicationState } from "../stores";
import { connectedToServer, updateDummy } from "../stores/wamp/actions";

const LiveContent: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const dispatch = useDispatch();
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);

  useEffect(() => {
    if (wamp.connected) {
      return;
    }
    console.log("Now connect to wamp server");
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      dispatch(connectedToServer());
      s.subscribe("dummy", (data) => {
        dispatch(updateDummy(data));
      });
    };
    conn.open();
  }, [loadTrigger, wamp.connected]);

  return wamp.connected ? <DummyData /> : <Spin />;
};

const DummyData: React.FC<{}> = () => {
  const dummyData = useSelector((state: ApplicationState) => state.wamp.data.dummy);
  if (typeof dummyData === "object") {
    console.log(dummyData);
    return (
      <>
        {Object.keys(dummyData).map((k) => (
          <Statistic title={k} value="tbd" />
        ))}
      </>
    );
  }
  return <Statistic title="Dummy" value="{dummyData}" />;
};

const DummySessionInfoData: React.FC<{}> = () => {
  const dummyData = useSelector((state: ApplicationState) => state.wamp.data.session);
  if (typeof dummyData === "object") {
    console.log(dummyData);
    return (
      <>
        {Object.keys(dummyData).map((k) => (
          <Statistic title={k} value="tbd" />
        ))}
      </>
    );
  }
  return <Statistic title="Dummy" value="{dummyData}" />;
};

export default LiveContent;
