import {
  CaretRightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  DownOutlined,
  LeftOutlined,
  PauseCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Select } from "antd";
import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalWamp } from "../commons/globals";
import { ApplicationState } from "../stores";
import { updateClassification, updateSessionInfo } from "../stores/racedata/actions";
import { replaySettings } from "../stores/ui/actions";

const { Option } = Select;

export const ReplayControl: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: ApplicationState) => state.userSettings.replay);

  const [timerHandle, setTimerHandle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentSessionTime, setCurrentSessionTime] = useState(settings.currentSessionTime);
  const [currentTs, setCurrentTs] = useState(0);
  const [loadTrigger, setLoadTrigger] = useState(0);

  useEffect(() => {
    console.log("useEffect");
    console.log("settings.playing: " + settings.playing);
    setPlaying(settings.playing);
    if (true || settings.playing) {
      console.log("settings.playing is true!!!");
      setTimerHandle(settings.timerHandle);
      setSpeed(settings.playSpeed);
      setCurrentSessionTime(settings.currentSessionTime);
      setCurrentTs(settings.currentTimestamp);
    }
  }, [loadTrigger]);

  const requestData = (startTimer?: boolean) => {
    const d = globalWamp.replayHolder?.next();
    console.log(d);
    console.log("settings.playing: " + settings.playing + " local.playing: " + playing);
    if (d) {
      dispatch(updateClassification({ msgType: d.msgType, timestamp: d.timestamp, data: d.data.cars }));
      dispatch(updateSessionInfo({ msgType: d.msgType, timestamp: d.timestamp, data: d.data.session }));

      const curSettings = {
        ...settings,
        currentSessionTime: d.data.session[0],
        currentTimestamp: d.timestamp,
        playing: playing,
        playSpeed: speed,
      };
      console.log(curSettings);
      // dispatch(replaySettings(curSettings));
      setCurrentSessionTime(d.data.session[0]);
      setCurrentTs(d.timestamp);
    }
  };

  const onChange = (value: any) => {
    const curSettings = { ...settings, currentSessionTime: value as number };
    dispatch(replaySettings(curSettings));
  };
  const updateSettings = (value: any) => {
    const curSettings = { ...settings, currentSessionTime: value as number };
    dispatch(replaySettings(curSettings));
    // dispatch(loadReplayData(value as number, 100));
    const startTs = (settings.minTimestamp + value) as number;
    globalWamp.replayHolder?.loadData(startTs);
  };
  const onPlayButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const curSpeed = speed > 0 ? speed : 1;
    const handle = setInterval(requestData, 1000 / speed);
    dispatch(replaySettings({ ...settings, playing: true, playSpeed: curSpeed, timerHandle: handle }));
    console.log(handle);
    setTimerHandle(handle);
    setPlaying(true);
    setSpeed(curSpeed);
  };

  const onPauseButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("pausing now " + timerHandle);
    clearInterval(timerHandle);
    setPlaying(false);
    dispatch(replaySettings({ ...settings, playing: false }));
  };

  const onChangeSpeed = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("new speed:" + e.currentTarget.value);
    const speed = parseInt(e.currentTarget.value);
    clearInterval(timerHandle);
    const handle = setInterval(requestData, 1000 / speed);
    setTimerHandle(handle);
    dispatch(replaySettings({ ...settings, playSpeed: speed, timerHandle: handle }));
  };

  const onChangeSpeedByDropdown = (e: any) => {
    console.log("new speed:" + e.key);
    // console.log(e.key);
    const speed = parseInt(e.key);
    clearInterval(timerHandle);
    const handle = setInterval(requestData, 1000 / speed);
    setTimerHandle(handle);
    setSpeed(speed);
    dispatch(replaySettings({ ...settings, playSpeed: speed, timerHandle: handle }));
  };

  const onStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("step:" + e.currentTarget.value);
    const step = parseInt(e.currentTarget.value);

    globalWamp.replayHolder?.loadData(currentTs + step);
  };

  const menu = () => (
    <Menu onClick={onChangeSpeedByDropdown}>
      {[1, 2, 5, 10, 15, 20].map((i) => (
        <Menu.Item key={i}>{i}x</Menu.Item>
      ))}
    </Menu>
  );
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

      <Button icon={<DoubleLeftOutlined />} onClick={onStep} value={-600} />
      <Button icon={<LeftOutlined />} onClick={onStep} value={-60} />
      <Button
        icon={playing ? <PauseCircleOutlined /> : <CaretRightOutlined />}
        onClick={playing ? onPauseButtonClicked : onPlayButtonClicked}
      />
      <Button icon={<RightOutlined />} onClick={onStep} value={60} />
      <Button icon={<DoubleRightOutlined />} onClick={onStep} value={600} />
      <Dropdown disabled={!playing} overlay={menu}>
        <Button>
          {settings.playSpeed}x <DownOutlined />
        </Button>
      </Dropdown>

      {/* {_.range(1, 10).map((i) => (
        <Button disabled={!playing} value={i} onClick={onChangeSpeed}>
          {i}x
        </Button>
      ))} */}
    </>
  );
};
