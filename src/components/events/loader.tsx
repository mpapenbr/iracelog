import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection, Session } from "autobahn-browser";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { ReplayDataHolder } from "../../processor/ReplayDataHolder";
import { processCarData } from "../../processor/processCarData";
import {
  processInboundManifests,
  updateEventInfo,
  updateTrackInfo,
} from "../../stores/racedata/actions";
import { ITrackInfo } from "../../stores/racedata/types";
import { updateSpeedmapData, updateSpeedmapEvolution } from "../../stores/speedmap/actions";
import { ISpeedmapEvolution } from "../../stores/speedmap/types";
import {
  replaySettings,
  stintRankingSettings,
  updateAvailableStandingsColumns,
} from "../../stores/ui/actions";
// import { initialReplaySettings } from "../../stores/ui/reducer";
import { defaultStateData as defaultUiStateData } from "../../stores/ui/reducer";

import { SpeedmapDataHolder } from "../../processor/SpeedmapDataHolder";
import { supportsCarData } from "../live/util";
import { doDistribute, resetUi } from "./datahandler";

interface MyProps {
  eventKey?: string;
  onFinished: (success: boolean) => void;
}
export const LoaderPage: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const config = globalWamp.backendConfig;
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [task, setTasks] = useState("");

  useEffect(() => {
    const conn = new Connection({
      url: config.crossbar.url,
      realm: config.crossbar.realm,
    });
    conn.onopen = async (s: Session) => {
      try {
        setTasks("Loading event info");
        const eventInfo = (await s.call("racelog.public.get_event_info_by_key", [
          props.eventKey,
        ])) as any;

        console.log(eventInfo);
        // TODO: WASM: I don't think we need this anymore
        // console.log(eventInfo.data.manifests);
        // const manifestDataStr = JSON.stringify(eventInfo.data.manifests);
        // console.log("calling initProc", wasmMethods.initProc(eventInfo.data.manifests));
        // console.log("calling initProcJsonStr", wasmMethods.initProcJsonStr(manifestDataStr));

        // dispatch(reset());
        resetUi(dispatch);
        const settings = {
          ...defaultUiStateData.replay,
          minTimestamp: eventInfo.data.replayInfo.minTimestamp,
          currentSessionTime: eventInfo.data.replayInfo.minSessionTime,
          minSessionTime: eventInfo.data.replayInfo.minSessionTime,
          maxSessionTime: eventInfo.data.replayInfo.maxSessionTime,
          enabled: true,
          eventKey: eventInfo.eventKey,
          eventId: eventInfo.id,
        };
        dispatch(replaySettings(settings));
        dispatch(updateEventInfo(eventInfo.data.info));

        dispatch(
          stintRankingSettings({
            ...defaultUiStateData.stintRanking,
            minSessionTime: eventInfo.data.replayInfo.minSessionTime,
            maxSessionTime: eventInfo.data.replayInfo.maxSessionTime,
            lowerRangeTime: eventInfo.data.replayInfo.minSessionTime,
            upperRangeTime: eventInfo.data.replayInfo.maxSessionTime,
          }),
        );

        setTasks("Loading track info");

        const trackInfo = (await s.call("racelog.public.get_track_info", [
          eventInfo.data.info.trackId,
        ])) as ITrackInfo;

        dispatch(updateTrackInfo(trackInfo));
        // const mData = JSON.parse(manifestData);
        setTasks("Loading analysis data");

        const data = (await s.call("racelog.public.archive.get_event_analysis", [
          eventInfo.id,
        ])) as any;

        // true if we have old data that doesn't support carData, speedmap etc
        const legacy = !supportsCarData(eventInfo.data.info.raceloggerVersion ?? "0.0.0");

        doDistribute(dispatch, defaultProcessRaceStateData, data, legacy);
        dispatch(processInboundManifests(eventInfo.data.manifests));
        // we need to reset here since standings page is defined as index page and will
        // already be called before this method is finished.
        dispatch(updateAvailableStandingsColumns({ ...defaultUiStateData.standingsColumns }));

        // console.log(eventInfo);
        if (!legacy) {
          console.log(
            "Yes, compatible racelogger ",
            eventInfo.data.info.raceloggerVersion,
            " found",
          );

          const carData = (await s.call("racelog.public.get_event_cars", [eventInfo.id])) as any;
          console.log(carData);

          processCarData(dispatch, carData);

          // TODO: WASM: I don't think we need this anymore
          // const tmp = wasmMethods.processCarMessage(carData);
          // console.log(tmp);

          const speedmap = (await s.call("racelog.public.get_event_speedmap", [
            eventInfo.id,
          ])) as any;
          // console.log(speedmap)
          dispatch(updateSpeedmapData(speedmap.payload));

          s.call("racelog.public.archive.avglap_over_time", [eventInfo.id, 300]).then((d: any) => {
            const x = d as ISpeedmapEvolution[];
            dispatch(updateSpeedmapEvolution(d as ISpeedmapEvolution[]));
          });
        }

        const rh = new ReplayDataHolder(s, settings, eventInfo.data.manifests);
        // TODO: reactivate speedmap holder
        const smh = new SpeedmapDataHolder(s, settings);
        globalWamp.replayHolder = rh;
        globalWamp.speedmapHolder = smh;
        globalWamp.currentLiveId = undefined;

        props.onFinished(true);
      } catch (e) {
        console.log(e);
        props.onFinished(false);
      }
      // navigate("/analysis/" + eventInfo.eventKey);
      // http://localhost:3000/analysis/a255fcac634d69cfab7a1e105c73f064/messages
      // http://localhost:3000/analysis/30e7c11c2cdc1177f5bb6ac9d5a52064/messages
    };
    conn.open();
  }, [loadTrigger]);

  return <>{task}</>;
};
