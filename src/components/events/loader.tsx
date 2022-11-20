import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection, Session } from "autobahn";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Comparator } from "semver";
import { globalWamp } from "../../commons/globals";
import { processCarData } from "../../processor/processCarData";
import { ReplayDataHolder } from "../../processor/ReplayDataHolder";
import { SpeedmapDataHolder } from "../../processor/SpeedmapDataHolder";
import {
  processInboundManifests,
  updateEventInfo,
  updateTrackInfo,
} from "../../stores/racedata/actions";
import { ITrackInfo } from "../../stores/racedata/types";
import { updateSpeedmapData, updateSpeedmapEvolution } from "../../stores/speedmap/actions";
import { ISpeedmapEvolution } from "../../stores/speedmap/types";
import { replaySettings, updateAvailableStandingsColumns } from "../../stores/ui/actions";
// import { initialReplaySettings } from "../../stores/ui/reducer";
import { defaultStateData as defaultUiStateData } from "../../stores/ui/reducer";

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

        doDistribute(dispatch, defaultProcessRaceStateData, data);
        dispatch(processInboundManifests(eventInfo.data.manifests));
        // we need to reset here since standings page is defined as index page and will
        // already be called before this method is finished.
        dispatch(updateAvailableStandingsColumns({ ...defaultUiStateData.standingsColumns }));

        const versionCheck = new Comparator(">=0.4.4");
        // console.log(eventInfo);
        if (versionCheck.test(eventInfo.data.info.raceloggerVersion ?? "0.0.0")) {
          console.log(
            "Yes, compatible racelogger ",
            eventInfo.data.info.raceloggerVersion,
            " found",
          );

          const carData = (await s.call("racelog.public.get_event_cars", [eventInfo.id])) as any;
          // console.log(carData);

          processCarData(dispatch, carData);

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
