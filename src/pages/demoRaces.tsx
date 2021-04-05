import { ReloadOutlined } from "@ant-design/icons";
import { Button, Col, List, Modal, Row } from "antd";
import autobahn, { Session } from "autobahn";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../commons/globals";
import { API_CROSSBAR_URL } from "../constants";
import { ApplicationState } from "../stores";
import { uiReset } from "../stores/ui/actions";
import {
  connectedToServer,
  updateCars,
  updateDummy,
  updateFromStateMessage,
  updateManifests,
  updateMessages,
  updatePitstops,
  updateSession,
} from "../stores/wamp/actions";
import { readData } from "./loadData";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const DemoRaces: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Loading data....");
  const [livedata, setLivedata] = useState([] as any[]);

  useEffect(() => {
    onReloadRequested();
  }, [loadTrigger]);

  const onButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const arg = e.currentTarget.value;
    setLoading(true);
    readData(arg, dispatch, doInfo);
    // setTimeout(() => setLoading(false), 2000);
  };
  const connectToLiveData = (id: string) => {
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.get_manifests", [id]).then((data: any) => {
        console.log(data);
        dispatch(updateManifests(data));
      });
      dispatch(connectedToServer());
      s.subscribe("dummy", (data) => {
        dispatch(updateDummy(data));
      });
      s.subscribe(sprintf("racelog.state.%s", id), (data) => {
        dispatch(updateFromStateMessage(data[0].payload));
        // dispatch(updateSession([data[0].payload.session]));
        // dispatch(updateMessages([data[0].payload.messages]));
        // dispatch(updateCars([data[0].payload.cars]));
        // dispatch(updatePitstops([data[0].payload.pitstops]));
      });
      s.subscribe(sprintf("racelog.session.%s", id), (data) => {
        dispatch(updateSession(data));
      });
      s.subscribe(sprintf("racelog.messages.%s", id), (data) => {
        dispatch(updateMessages(data));
      });
      s.subscribe(sprintf("racelog.cars.%s", id), (data) => {
        dispatch(updateCars(data));
      });
      s.subscribe(sprintf("racelog.pits.%s", id), (data) => {
        dispatch(updatePitstops(data));
      });
    };
    conn.open();

    globalWamp.conn = conn;
    globalWamp.currentLiveId = id;
  };

  const onLiveButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.value as string;
    if (globalWamp.currentLiveId === undefined) {
      connectToLiveData(id);
    } else {
      if (id.localeCompare(globalWamp.currentLiveId) === 0) {
        // do nothing - user wanted to connect to current session
        console.log("ignoring - already connection to session");
      } else {
        if (globalWamp.conn !== undefined) {
          console.log("closing connection");
          globalWamp.conn.close();
        }
        connectToLiveData(id);
      }
    }

    dispatch(uiReset());
    history.push("/analysis");
    // setTimeout(() => setLoading(false), 2000);
  };

  const doInfo = (msg: string) => {
    if ("done".localeCompare(msg) === 0) {
      dispatch(uiReset());
      setLoading(false);
      history.push("/analysis");
    }
    setInfo(msg);
  };

  const onReloadRequested = () => {
    console.log("fetching current live data providers");
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.list_providers").then((data: any) => {
        setLivedata(data.map((v: any) => ({ key: v.key, title: v.name, description: v.description })));
        // conn.close();
      });
    };
    conn.open();
  };

  const data = [
    {
      title: "AI demo: GT3 race Watkins",
      description: "3h+ race with 20 GT3",
      key: "1",
    },
    {
      title: "AI demo: The Special Characters at Watkins",
      description:
        "a lot of pitstops, short stints, mainly used to check if umlauts and other character decorations are ok.",
      key: "2",
    },
    {
      title: "AI Demo: GT3 race at Barcelona",
      description: "3h race longer stints, 30 GT3",
      key: "3",
    },
    {
      title: "NEO Race 6h Barcelona",
      description: "Used for Multiclass tests. Be patient while loading (~30-45s)",
      key: "neo",
    },
  ];
  return (
    <Row gutter={16}>
      <Col span={6}>
        <List
          header={<h3>Demo races</h3>}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button value={item.key} type="default" onClick={onButtonClicked}>
                  Load
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <Modal title="Loading" visible={loading} closable={false} footer={<></>}>
          {info}
        </Modal>
      </Col>
      <Col span={6}>
        <List
          header={
            <Row justify="space-between">
              <Col span={12}>
                <h3>Live data</h3>
              </Col>
              <Col offset={10}>
                {" "}
                <Button icon={<ReloadOutlined />} onClick={onReloadRequested} />
              </Col>
            </Row>
          }
          dataSource={livedata}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button value={item.key} type="default" onClick={onLiveButtonClicked}>
                  Connect
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};
