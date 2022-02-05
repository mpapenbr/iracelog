import { Layout, Menu } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Classification from "../components/live/classification";
import RaceMessages from "../components/live/raceMessages";
import { API_LOCAL_DEV_MODE } from "../constants";
import { CarPitstopsContainer } from "../container/CarPitstopsContainer";
import { CarStintsContainer } from "../container/CarStintsContainer";
import { DashboardContainer } from "../container/DashboardContainer";
import { DriverLapsContainer } from "../container/DriverLapsContainer";
import { RaceGraphByReferenceContainer } from "../container/RaceGraphByReferenceContainer";
import { RaceGraphContainer } from "../container/RaceGraphContainer";
import { RacePositionsContainer } from "../container/RacePositionsContainer";
import { ReplayCircleOfDoomContainer } from "../container/ReplayCircleOfDoomContainer";
import { StintLapsContainer } from "../container/StintLapsContainer";
import { StintSummaryContainer } from "../container/StintSummaryContainer";
import { TestContainer } from "../container/Test";
import { ApplicationState } from "../stores";

const { Header, Sider, Content } = Layout;

const OtherContent: React.FC = () => <div>Here goes other content</div>;

export const AnalysisMainPage: React.FC = () => {
  const params = useParams();
  const replaySettings = useSelector((state: ApplicationState) => state.userSettings.replay);

  console.log(params);
  if (replaySettings.eventKey !== params.eventId) {
    console.log("should load " + params.eventId);
  }
  return (
    <Layout>
      <Sider theme="light" width={170}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="classification" className="race-sidebar">
            <Link to="classification">Classification</Link>
          </Menu.Item>

          <Menu.Item key="cod" className="race-sidebar">
            <Link to="replayCOD">Circle of doom</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphARecharts" className="race-sidebar">
            <Link to="raceGraphARecharts">Race graph (Leader)</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphBRecharts" className="race-sidebar">
            <Link to="raceGraphBRecharts">Race graph (Car)</Link>
          </Menu.Item>

          <Menu.Item key="racePositionsNivo" className="race-sidebar">
            <Link to="racePositionsNivo">Race positions</Link>
          </Menu.Item>

          <Menu.Item key="dashboard" className="race-sidebar">
            <Link to="dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="driverLapsRecharts" className="race-sidebar">
            <Link to="driverLapsRecharts">Driver laps </Link>
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
          <Menu.Item key="messages" className="race-sidebar">
            <Link to="messages">Messages</Link>
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
        <Routes>
          <Route path="classification" element={<Classification />} />
          <Route index element={<Classification />} />

          <Route path="replayCOD" element={<ReplayCircleOfDoomContainer />} />

          <Route path="raceGraphARecharts" element={<RaceGraphContainer />} />

          <Route path="raceGraphBRecharts" element={<RaceGraphByReferenceContainer />} />

          <Route path="racePositionsNivo" element={<RacePositionsContainer />} />
          <Route path="dashboard" element={<DashboardContainer />} />

          <Route path="driverLapsRecharts" element={<DriverLapsContainer />} />
          <Route path="carPitstops" element={<CarPitstopsContainer />} />

          <Route path="stintDurations" element={<CarStintsContainer />} />
          <Route path="stintLaps" element={<StintLapsContainer />} />
          <Route path="stintSummary" element={<StintSummaryContainer />} />
          <Route path="messages" element={<RaceMessages />} />
          <Route path="test" element={<TestContainer />} />
        </Routes>
      </Content>
    </Layout>
  );
};
