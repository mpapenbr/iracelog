import { Layout, Menu, Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { Comparator } from "semver";
import { globalWamp } from "../commons/globals";
import Classification from "../components/live/classification";
import RaceMessages from "../components/live/raceMessages";
import { API_LOCAL_DEV_MODE } from "../constants";
import { CarPitstopsContainer } from "../container/CarPitstopsContainer";
import { CarStintsContainer } from "../container/CarStintsContainer";
import { DashboardContainer } from "../container/DashboardContainer";
import { DriverLapsContainer } from "../container/DriverLapsContainer";
import { RaceEntriesContainer } from "../container/RaceEntriesContainer";
import { RaceGraphByReferenceContainer } from "../container/RaceGraphByReferenceContainer";
import { RaceGraphContainer } from "../container/RaceGraphContainer";
import { RacePositionsContainer } from "../container/RacePositionsContainer";
import { ReplayCircleOfDoomContainer } from "../container/ReplayCircleOfDoomContainer";
import { SettingsContainer } from "../container/SettingsContainer";
import { SpeedmapContainer } from "../container/SpeedmapContainer";
import { StintLapsContainer } from "../container/StintLapsContainer";
import { StintSummaryContainer } from "../container/StintSummaryContainer";
import { StrategyContainer } from "../container/StrategyContainer";
import { TestContainer } from "../container/Test";
import { ApplicationState } from "../stores";
import { LoaderPage } from "./loader";

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
  console.log(eventInfo);
  const speedmapReady = new Comparator(">=0.4.4").test(eventInfo.raceloggerVersion ?? "0.0.0");
  const raceEntriesReady = new Comparator(">=0.4.4").test(eventInfo.raceloggerVersion ?? "0.0.0");

  return (
    <Layout>
      <Sider theme="light" width={170}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="events" className="race-sidebar">
            <Link to="/events">Events</Link>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item key="classification" className="race-sidebar">
            <Link to="classification">Classification</Link>
          </Menu.Item>

          <Menu.Item key="cod" className="race-sidebar">
            <Link to="replayCOD">Circle of doom</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphA" className="race-sidebar">
            <Link to="raceGraphA">Race graph (Leader)</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphB" className="race-sidebar">
            <Link to="raceGraphB">Race graph (Car)</Link>
          </Menu.Item>

          <Menu.Item key="racePositionsNivo" className="race-sidebar">
            <Link to="racePositionsNivo">Race positions</Link>
          </Menu.Item>

          <Menu.Item key="dashboard" className="race-sidebar">
            <Link to="dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="strategy" className="race-sidebar">
            <Link to="strategy">Strategy</Link>
          </Menu.Item>

          <Menu.Item key="driverLaps" className="race-sidebar">
            <Link to="driverLaps">Driver laps </Link>
          </Menu.Item>

          <Menu.Item key="carPitstops" className="race-sidebar">
            <Link to="carPitstops">Pitstops</Link>
          </Menu.Item>
          <Menu.Item key="stintDurations" className="race-sidebar">
            <Link to="stintDurations">Stint Durations</Link>
          </Menu.Item>
          <Menu.Item key="stintLaps" className="race-sidebar">
            <Link to="stintLaps">Stint Laps</Link>
          </Menu.Item>
          <Menu.Item key="stintSummary" className="race-sidebar">
            <Link to="stintSummary">Stint Summary</Link>
          </Menu.Item>
          {speedmapReady ? (
            <Menu.Item key="speedmap" className="race-sidebar">
              <Link to="speedmap">Speedmap</Link>
            </Menu.Item>
          ) : (
            <></>
          )}
          {raceEntriesReady ? (
            <Menu.Item key="raceEntries" className="race-sidebar">
              <Link to="raceEntries">Race entries</Link>
            </Menu.Item>
          ) : (
            <></>
          )}
          <Menu.Item key="messages" className="race-sidebar">
            <Link to="messages">Messages</Link>
          </Menu.Item>
          <Menu.Item key="settings" className="race-sidebar">
            <Link to="settings">Settings</Link>
          </Menu.Item>

          {API_LOCAL_DEV_MODE ? (
            <Menu.Item key="test" className="race-sidebar">
              <Link to="test">test</Link>
            </Menu.Item>
          ) : (
            <></>
          )}
        </Menu>
      </Sider>
      <Content>
        <Modal title="Loading" visible={loading} closable={false} footer={<></>}>
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

          <Route path="replayCOD" element={<ReplayCircleOfDoomContainer />} />

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
