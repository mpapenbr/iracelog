import { ReloadOutlined } from "@ant-design/icons";
import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Button, Col, Descriptions, List, Row } from "antd";
import { Connection, Session } from "autobahn-browser";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { ICarDataMessage, processCarData } from "../../processor/processCarData";
import { processSpeedmap } from "../../processor/processSpeedmap";
import { updateEventInfo, updateManifests, updateTrackInfo } from "../../stores/racedata/actions";
import { ISpeedmapMessage, ITrackInfo } from "../../stores/racedata/types";
import { postProcessManifest } from "../../stores/racedata/util";
import { updateAvailableStandingsColumns } from "../../stores/ui/actions";
import { defaultStateData as defaultUiStateData } from "../../stores/ui/reducer";

import { doDistribute } from "./datahandler";

export const LiveEvents: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [livedata, setLivedata] = useState([] as any[]);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const config = globalWamp.backendConfig;

  useEffect(() => {
    onReloadRequested();
  }, [loadTrigger]);

  const connectToLiveData = (eventKey: string) => {
    const conn = new Connection({
      url: config.crossbar.url,
      realm: config.crossbar.realm,
    });

    conn.onopen = async (s: Session) => {
      s.call("racelog.public.live.get_event_analysis", [eventKey]).then((data: any) => {
        console.log(data); // we  will always get an array here (due to WAMP)
        // dispatch(updateManifests(data.manifests)); // these are the "small" manifests
        const manifests = postProcessManifest(data.manifests);
        dispatch(updateManifests(manifests));
        dispatch(updateAvailableStandingsColumns(defaultUiStateData.standingsColumns)); // reset here, trigger standings page recompute
        globalWamp.processor = new BulkProcessor(manifests, data.processedData);

        doDistribute(dispatch, defaultProcessRaceStateData, data.processedData);
        globalWamp.currentData = data.processedData;
      });

      // TODO: maybe combine this with above call
      await s.call("racelog.public.get_event_info_by_key", [eventKey]).then(async (data: any) => {
        console.log(data);
        dispatch(updateEventInfo(data.data.info));
        const trackInfo = (await s.call("racelog.public.get_track_info", [
          data.data.info.trackId,
        ])) as ITrackInfo;
        dispatch(updateTrackInfo(trackInfo));
      });

      s.call("racelog.public.get_event_cars_by_key", [eventKey]).then(async (data: any) => {
        console.log(data);
        processCarData(dispatch, data);
      });
      s.call("racelog.public.get_event_speedmap_by_key", [eventKey]).then(async (data: any) => {
        // console.log(data);
        processSpeedmap(dispatch, data);
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
      s.subscribe(
        sprintf("racelog.public.live.speedmap.%s", eventKey),
        (data: any[] | undefined) => {
          if (data != undefined) {
            processSpeedmap(dispatch, data[0] as ISpeedmapMessage);
          }
        },
      );
      s.subscribe(sprintf("racelog.public.live.cardata.%s", eventKey), (data: any) => {
        // console.log(data);
        if (data != undefined) {
          processCarData(dispatch, data[0] as ICarDataMessage);
        }
      });
    };
    conn.open();

    globalWamp.conn = conn;
    globalWamp.currentLiveId = eventKey;
  };

  const onLiveButtonClicked = (e: React.MouseEvent) => {
    const id = (e.currentTarget as HTMLInputElement).value as string;
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

    const conn = new Connection({
      url: config.crossbar.url,
      realm: config.crossbar.realm,
    });
    conn.onopen = (s: Session) => {
      s.call("racelog.public.list_providers").then((data: any) => {
        console.log(data);
        setLivedata(
          data.map((v: any) => ({
            key: v.eventKey,
            name: v.info.name,
            description: v.info.description,
            track: {
              name: v.info.trackDisplayName,
            },
          })),
        );
        conn.close();
      });
    };
    conn.open();
  };

  return (
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
            <Button
              key={"bt-live" + item.eventId}
              value={item.key}
              type="default"
              onClick={onLiveButtonClicked}
            >
              Connect
            </Button>,
          ]}
        >
          <Descriptions size="small" column={2} colon={false}>
            <Descriptions.Item span={item.description ? 1 : 2}>
              <b>{item.name}</b>
            </Descriptions.Item>
            {item.description ? (
              <Descriptions.Item>
                <div className="iracelog-event-description">{item.description}</div>
              </Descriptions.Item>
            ) : (
              <></>
            )}
            <Descriptions.Item span={2} label={item.track.name}>
              {/* {new Date(item.recordDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })} */}
            </Descriptions.Item>
          </Descriptions>
        </List.Item>
      )}
    />
  );
};
