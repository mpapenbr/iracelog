import { CaretRightOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../stores";
import { demoSettings, replaySettings } from "../stores/ui/actions";

const { Option } = Select;

let th: NodeJS.Timeout;

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

export const ReplayControlDummy: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: ApplicationState) => state.userSettings.replay);
  const extCounter = useSelector((state: ApplicationState) => state.userSettings.counter);
  const [timerHandle, setTimerHandle] = useState(0);
  const [playing, setPlaying] = useState(settings.playing);
  const [speed, setSpeed] = useState(1);
  const [localValue, setLocalValue] = useState(settings.currentSessionTime);
  const [currentTs, setCurrentTs] = useState(0);
  const [loadTrigger, setLoadTrigger] = useState(0);

  console.log("ENTRY: localValue: " + localValue + " extCounter: " + extCounter);

  const dummyMethod = () => {
    console.log("dummy called. localValue: " + localValue + " extCounter: " + extCounter);
    const newVal = extCounter + 1;
    dispatch(demoSettings(newVal));
  };
  useEffect(() => {
    console.log("settings.playing: " + settings.playing + " local.playing: " + playing);
    if (!settings.playing) {
      console.log("not playing, get out");
      return;
    }
    // const id = setInterval(dummyMethod, 1000);
    // return () => {
    //   clearInterval(id);
    // };
  }, [playing]);

  useInterval(() => dummyMethod(), playing ? 1000 : null);

  const onPlayButtonClicked = (e: React.MouseEvent) => {
    const curSpeed = speed > 0 ? speed : 1;
    dispatch(replaySettings({ ...settings, playing: true, playSpeed: curSpeed }));
    //console.log(handle);

    setPlaying(true);
    setSpeed(curSpeed);
  };

  const onPauseButtonClicked = (e: React.MouseEvent) => {
    console.log("pausing now " + th);
    setPlaying(false);
    dispatch(replaySettings({ ...settings, playing: false }));
  };

  return (
    <>
      {/* <Slider
        min={settings.minSessionTime}
        max={settings.maxSessionTime}
        value={settings.currentSessionTime}
        defaultValue={settings.currentSessionTime}
        tooltipVisible={true}
        onChange={onChange}
        onAfterChange={updateSettings}
      /> */}

      <Button
        icon={playing ? <PauseCircleOutlined /> : <CaretRightOutlined />}
        onClick={playing ? onPauseButtonClicked : onPlayButtonClicked}
      />

      {/* {_.range(1, 10).map((i) => (
        <Button disabled={!playing} value={i} onClick={onChangeSpeed}>
          {i}x
        </Button>
      ))} */}
    </>
  );
};
