import { Layout, Menu, Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { Comparator } from "semver";
import { globalWamp } from "../commons/globals";
import { LoaderPage } from "../components/events/loader";
import Classification from "../components/live/classification";
import RaceMessages from "../components/live/raceMessages";
import { BigCircleOfDoomContainer } from "../container/BigCircleOfDoomContainer";
import { CarPitstopsContainer } from "../container/CarPitstopsContainer";
import { CarStintsContainer } from "../container/CarStintsContainer";
import { CustomStandingsContainer } from "../container/CustomStandingsContainer";
import { DashboardContainer } from "../container/DashboardContainer";
import { DriverLapsContainer } from "../container/DriverLapsContainer";
import { RaceEntriesContainer } from "../container/RaceEntriesContainer";
import { RaceGraphByReferenceContainer } from "../container/RaceGraphByReferenceContainer";
import { RaceGraphContainer } from "../container/RaceGraphContainer";
import { RacePositionsContainer } from "../container/RacePositionsContainer";
import { SettingsContainer } from "../container/SettingsContainer";
import { SpeedmapContainer } from "../container/SpeedmapContainer";
import { StintLapsContainer } from "../container/StintLapsContainer";
import { StintRankingContainer } from "../container/StintRankingContainer";
import { StintSummaryContainer } from "../container/StintSummaryContainer";
import { StrategyContainer } from "../container/StrategyContainer";
import { TestContainer } from "../container/Test";
import { ApplicationState } from "../stores";

const { Header, Sider, Content } = Layout;

const OtherContent: React.FC = () => <div>Here goes other content</div>;

export const AnalysisMainPage: React.FC = () => {
  const params = useParams();
  const replaySettings = useSelector((state: ApplicationState) => state.userSettings.replay);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  // console.log(params);
  useEffect(() => {
    // if live event is running, we don't need to do anything here
    if (globalWamp.currentLiveId) {
      return;
    }
    if (replaySettings.eventKey !== params.eventKey) {
      console.log("should load " + params.eventKey);
      setLoading(true);
    } else {
      console.log("event " + params.eventId + " already loaded");
    }
  }, [loadTrigger]);
  // console.log(eventInfo);

  const allItems = [
    { label: <Link to="/events">Events</Link>, key: "events" },
    { type: "divider", key: "menuDivider" },
    { label: <Link to="classification">Classification</Link>, key: "classification" },
    { label: <Link to="customStandings">Standings (custom)</Link>, key: "customStandings" },
    { label: <Link to="cod">Circle of doom</Link>, key: "cod", requires: ">=0.4.4" },
    { label: <Link to="raceGraphA">Race graph (Leader)</Link>, key: "raceGraphA" },
    { label: <Link to="raceGraphB">Race graph (Car)</Link>, key: "raceGraphB" },
    { label: <Link to="racePositionsNivo">Race positions</Link>, key: "racePositionsNivo" },
    { label: <Link to="dashboard">Dashboard</Link>, key: "dashboard" },
    { label: <Link to="strategy">Strategy</Link>, key: "strategy" },
    { label: <Link to="driverLaps">Driver laps </Link>, key: "driverLaps" },
    { label: <Link to="carPitstops">Pitstops</Link>, key: "carPitstops" },
    { label: <Link to="stintDurations">Stint Durations</Link>, key: "stintDurations" },
    { label: <Link to="stintSummary">Stint Summary</Link>, key: "stintSummary" },
    { label: <Link to="stintRanking">Stint Ranking</Link>, key: "stintRanking" },
    { label: <Link to="speedmap">Speedmap</Link>, key: "speedmap", requires: ">=0.4.4" },
    { label: <Link to="raceEntries">Race entries</Link>, key: "raceEntries", requires: ">=0.4.4" },
    { label: <Link to="messages">Messages</Link>, key: "messages" },
    { label: <Link to="settings">Settings</Link>, key: "settings" },
  ];
  const items = allItems.filter((v) =>
    new Comparator(v.requires ?? ">=0.0.0").test(eventInfo.raceloggerVersion),
  );
  return (
    <Layout>
      <Sider theme="light" width={170}>
        <Menu theme="light" mode="inline" items={items} />
      </Sider>
      <Content>
        <Modal title="Loading" open={loading} closable={false} footer={<></>}>
          {/* {info} */}
          <LoaderPage
            eventKey={params.eventKey}
            onFinished={(success) => {
              if (!success) {
                notification["error"]({
                  message: "Load event",
                  description: `The requested event ${params.eventKey} does not exist.`,
                });
              }
              setLoading(false);
            }}
          />
        </Modal>
        <Routes>
          <Route path="classification" element={<Classification />} />
          <Route index element={<Classification />} />

          <Route path="customStandings" element={<CustomStandingsContainer />} />
          <Route path="cod" element={<BigCircleOfDoomContainer />} />

          <Route path="raceGraphA" element={<RaceGraphContainer />} />

          <Route path="raceGraphB" element={<RaceGraphByReferenceContainer />} />

          <Route path="racePositionsNivo" element={<RacePositionsContainer />} />
          <Route path="dashboard" element={<DashboardContainer />} />
          <Route path="strategy" element={<StrategyContainer />} />

          <Route path="driverLaps" element={<DriverLapsContainer />} />
          <Route path="carPitstops" element={<CarPitstopsContainer />} />

          <Route path="stintDurations" element={<CarStintsContainer />} />
          <Route path="stintLaps" element={<StintLapsContainer />} />
          <Route path="stintSummary" element={<StintSummaryContainer />} />
          <Route path="stintRanking" element={<StintRankingContainer />} />
          <Route path="messages" element={<RaceMessages />} />
          <Route path="settings" element={<SettingsContainer />} />
          <Route path="test" element={<TestContainer />} />
          <Route path="speedmap" element={<SpeedmapContainer />} />
          <Route path="raceEntries" element={<RaceEntriesContainer />} />
        </Routes>
      </Content>
    </Layout>
  );
};
