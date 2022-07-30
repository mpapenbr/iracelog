import { ReloadOutlined } from "@ant-design/icons";
import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Button, Col, List, Row } from "antd";
import autobahn, { Session } from "autobahn";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
// import { useHistory } from "react-router";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../commons/globals";
import { updateAvailableStandingsColumns } from "../stores/basedata/actions";
import { updateEventInfo, updateTrackInfo } from "../stores/racedata/actions";
import { ITrackInfo } from "../stores/racedata/types";
import { connectedToServer, setManifests } from "../stores/wamp/actions";
import { postProcessManifest } from "../stores/wamp/reducer";
import { doDistribute } from "./datahandler";

export const DemoRaces: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const [livedata, setLivedata] = useState([] as any[]);
  const [events, setEvents] = useState([] as any[]);
  // const [config, setConfig] = useState({ crossbar: { url: "xx", realm: "yy" } } as Config);

  const config = globalWamp.backendConfig;
  useEffect(() => {
    onReloadRequested();
    onLoadEvents();
  }, [loadTrigger]);

  const onLoadForReplayButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const arg = e.currentTarget.value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg);
  };

  const connectToLiveData = (eventKey: string) => {
    const conn = new autobahn.Connection({ url: config.crossbar.url, realm: config.crossbar.realm });

    conn.onopen = (s: Session) => {
      s.call("racelog.public.live.get_event_analysis", [eventKey]).then((data: any) => {
        console.log(data); // we  will always get an array here (due to WAMP)
        // dispatch(updateManifests(data.manifests)); // these are the "small" manifests
        const manifests = postProcessManifest(data.manifests);
        dispatch(setManifests(manifests));
        dispatch(updateAvailableStandingsColumns([])); // reset here, trigger standings page recompute
        globalWamp.processor = new BulkProcessor(manifests, data.processedData);

        doDistribute(dispatch, defaultProcessRaceStateData, data.processedData);
        globalWamp.currentData = data.processedData;
      });
      dispatch(connectedToServer());
      // TODO: maybe combine this with above call
      s.call("racelog.public.get_event_info_by_key", [eventKey]).then(async (data: any) => {
        console.log(data);
        dispatch(updateEventInfo(data.data.info));
        const trackInfo = (await s.call("racelog.public.get_track_info", [data.data.info.trackId])) as ITrackInfo;
        dispatch(updateTrackInfo(trackInfo));
      });
      s.subscribe(sprintf("racelog.public.live.state.%s", eventKey), (data) => {
        const theProc = globalWamp.processor;
        // important, otherwise we don't detect changes on carLaps,carStints,.... (all those Array.from(...) attrs of BulkProcessor)
        // raceGraph would be ok though. Needs further investigation
        const curData = _.cloneDeep(globalWamp.currentData!);
        if (data != undefined) {
          const newData = theProc!.process([data[0]]);

          doDistribute(dispatch, curData, newData);
          globalWamp.currentData = { ...newData };
        }
      });
    };
    conn.open();

    globalWamp.conn = conn;
    globalWamp.currentLiveId = eventKey;
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

    // navigate("/analysis/" + id, { state: { id: id } });
    navigate("/analysis/" + id);
    // setTimeout(() => setLoading(false), 2000);
  };

  const onReloadRequested = async () => {
    console.log("fetching current live data providers");

    const conn = new autobahn.Connection({ url: config.crossbar.url, realm: config.crossbar.realm });
    conn.onopen = (s: Session) => {
      s.call("racelog.public.list_providers").then((data: any) => {
        console.log(data);
        setLivedata(data.map((v: any) => ({ key: v.eventKey, title: v.info.name, description: v.info.description })));
        conn.close();
      });
    };
    conn.open();
  };

  const onLoadEvents = () => {
    console.log("fetching events");
    const conn = new autobahn.Connection({ url: config.crossbar.url, realm: config.crossbar.realm });
    conn.onopen = (s: Session) => {
      s.call("racelog.public.get_events").then((data: any) => {
        setEvents(
          data.map((v: any) => ({ key: v.eventKey, title: v.name, description: v.description, eventId: v.id }))
        );
        conn.close();
      });
    };
    conn.open();
  };

  return (
    <Row gutter={16}>
      <Col span={10}>
        <List
          header={<h3>Demo races</h3>}
          dataSource={events}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                // <Button value={item.key} type="default" onClick={onLoadButtonClicked_OoO}>
                //   Load
                // </Button>,
                <Button
                  key={"bt-replay" + item.eventId}
                  value={item.key}
                  type="default"
                  onClick={onLoadForReplayButtonClicked}
                >
                  Load
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Col>
      <Col span={8}>
        <List
          header={
            <Row justify="space-between">
              <Col span={12}>
                <h3>Live data</h3>
              </Col>
              <Col offset={8}>
                <Button icon={<ReloadOutlined />} onClick={onReloadRequested} />
              </Col>
            </Row>
          }
          dataSource={livedata}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button key={"bt-live" + item.eventId} value={item.key} type="default" onClick={onLiveButtonClicked}>
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
