import { ReloadOutlined } from "@ant-design/icons";
import {
  IRaceGraph,
  defaultProcessRaceStateData,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
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
import {
  processInboundManifests,
  updateEventInfo,
  updateTrackInfo,
} from "../../stores/racedata/actions";
import { ISpeedmapMessage, ITrackInfo } from "../../stores/racedata/types";
import { updateAvailableStandingsColumns } from "../../stores/ui/actions";
import { defaultStateData as defaultUiStateData } from "../../stores/ui/reducer";

import { applyPatch } from "fast-json-patch";
import { MessageType } from "../../stores/types/message";
import wasmMethods from "../../wasm/wasmloader";
import { doDistribute, resetUi } from "./datahandler";

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
      const eventInfo = (await s.call("racelog.public.get_event_info_by_key", [eventKey])) as any;
      const trackInfo = (await s.call("racelog.public.get_track_info", [
        eventInfo.data.info.trackId,
      ])) as ITrackInfo;
      const carData = (await s.call("racelog.public.get_event_cars", [eventInfo.id])) as any;
      const speedmap = (await s.call("racelog.public.get_event_speedmap", [eventInfo.id])) as any;
      const analysisData = (await s.call("racelog.public.live.get_event_analysis_by_key", [
        eventKey,
      ])) as any;

      console.log(eventInfo);
      wasmMethods.initProc(eventInfo.data.manifests);
      wasmMethods.processCarMessage(carData);
      wasmMethods.reinitWithAnalysisData(analysisData.kwargs.processedData);

      resetUi(dispatch);
      dispatch(updateEventInfo(eventInfo.data.info));
      dispatch(updateTrackInfo(trackInfo));
      doDistribute(dispatch, defaultProcessRaceStateData, analysisData.kwargs.processedData);
      dispatch(processInboundManifests(eventInfo.data.manifests));
      processCarData(dispatch, carData);
      processSpeedmap(dispatch, speedmap);
      globalWamp.currentData = analysisData.kwargs.processedData;
      console.log("currente working data: ", globalWamp.currentData);

      // we need to reset here since standings page is defined as index page and will
      // already be called before this method is finished.
      dispatch(updateAvailableStandingsColumns({ ...defaultUiStateData.standingsColumns }));
      // deactivated by design - will be removed by issue #1036
      if (false) {
        s.subscribe(sprintf("racelog.public.live.state.%s", eventKey), (data) => {
          // important, otherwise we don't detect changes on carLaps,carStints,.... (all those Array.from(...) attrs of BulkProcessor)
          // raceGraph would be ok though. Needs further investigation
          const curData = _.cloneDeep(globalWamp.currentData!);
          // if (data != undefined) {
          //   const newData = theProc!.process([data[0]]);

          //   doDistribute(dispatch, curData, newData);
          //   globalWamp.currentData = { ...newData };
          // }
          // const ret = curData;
          const retS = wasmMethods.processStateMessage(data[0]);
          // console.log("state message processed:", retS.length);
          // print length of retS
          // console.log("length of str:", retS.length);
          const ret = JSON.parse(retS);
          // console.log(ret);
          doDistribute(dispatch, curData, ret);
          globalWamp.currentData = { ...ret };
        });
      }

      s.subscribe(sprintf("racelog.public.live.analysis.%s", eventKey), (data) => {
        // important, otherwise we don't detect changes on carLaps,carStints,.... (all those Array.from(...) attrs of BulkProcessor)
        // raceGraph would be ok though. Needs further investigation
        const curData = _.cloneDeep(globalWamp.currentData!);

        // if (data != undefined) {
        //   const newData = theProc!.process([data[0]]);

        //   doDistribute(dispatch, curData, newData);
        //   globalWamp.currentData = { ...newData };
        // }
        // const ret = curData;
        switch (data[0].type) {
          case MessageType.ANALYSIS_COMBINED_PATCH: {
            const workData = _.cloneDeep(globalWamp.currentData!);
            try {
              applyPatch(workData, data[0].payload.patches ?? []);
              workData.cars = data[0].payload.cars;
              workData.session = data[0].payload.session;
              workData.raceOrder = data[0].payload.raceOrder;

              // create map by carClass with value IRaceGraph[] from workData.raceGraph[]
              if ((data[0].payload.raceGraphPatches ?? []).length > 0) {
                const raceGraphByClass = new Map<string, IRaceGraph[]>();
                workData.raceGraph.forEach((v) => {
                  if (raceGraphByClass.has(v.carClass)) {
                    // append to existing array
                    raceGraphByClass.set(v.carClass, [...raceGraphByClass.get(v.carClass)!, v]);
                  } else {
                    raceGraphByClass.set(v.carClass, [v]);
                  }
                });
                data[0].payload.raceGraphPatches.forEach((v: any) => {
                  const carClass = v.carClass;
                  const patches = v.patches;

                  if (raceGraphByClass.has(carClass)) {
                    applyPatch(raceGraphByClass.get(carClass), patches);
                  }
                });
                // create an array from the map values and assign to workData.raceGraph
                workData.raceGraph = Array.from(raceGraphByClass.values()).flat();
                // console.log("raceGraph updated", workData.raceGraph);
                // console.log("patch result: ", patchResult);
              }
              doDistribute(dispatch, curData, workData);
              globalWamp.currentData = { ...workData };
            } catch (someError) {
              console.log("Trying to fetch complete new analysis data");
              s.call("racelog.public.live.get_event_analysis_by_key", [eventKey]).then(
                (analysisData) => {
                  doDistribute(dispatch, curData, analysisData.kwargs.processedData);
                  globalWamp.currentData = { ...analysisData.kwargs.processedData };
                },
              );
            }

            break;
          }
          default: {
            console.log("unknown analysis message type: ", data[0].type);
          }
        }
        // console.log("analysis message received: ", data);
      });

      s.subscribe(
        sprintf("racelog.public.live.speedmap.%s", eventKey),
        (data: any[] | undefined) => {
          if (data != undefined) {
            console.log("speedmap message received: ");
            processSpeedmap(dispatch, data[0] as ISpeedmapMessage);
          }
        },
      );
      if (false) {
        s.subscribe(sprintf("racelog.public.live.cardata.%s", eventKey), (data: any) => {
          // console.log(data);
          // deactivated by design - will be removed by issue #1036
          if (data != undefined) {
            const curData = _.cloneDeep(globalWamp.currentData!);
            console.log("carData message received: ");
            const retS = wasmMethods.processCarMessage(data[0]);
            const ret = JSON.parse(retS);
            // console.log(ret);
            doDistribute(dispatch, curData, ret);
            globalWamp.currentData = { ...ret };
            processCarData(dispatch, data[0] as ICarDataMessage);
          }
        });
      }
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
