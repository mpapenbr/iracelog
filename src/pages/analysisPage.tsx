import { Layout, Menu } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
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

const { Header, Sider, Content } = Layout;

const OtherContent: React.FC = () => <div>Here goes other content</div>;

export const AnalysisMainPage: React.FC = () => {
  return (
    <Layout>
      <Sider theme="light" width={170}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="classification" className="race-sidebar">
            <Link to="/analysis/classification">Classification</Link>
          </Menu.Item>

          <Menu.Item key="cod" className="race-sidebar">
            <Link to="/analysis/replayCOD">Circle of doom</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphARecharts" className="race-sidebar">
            <Link to="/analysis/raceGraphARecharts">Race graph (Leader)</Link>
          </Menu.Item>

          <Menu.Item key="raceGraphBRecharts" className="race-sidebar">
            <Link to="/analysis/raceGraphBRecharts">Race graph (Car)</Link>
          </Menu.Item>

          <Menu.Item key="racePositionsNivo" className="race-sidebar">
            <Link to="/analysis/racePositionsNivo">Race positions</Link>
          </Menu.Item>

          <Menu.Item key="dashboard" className="race-sidebar">
            <Link to="/analysis/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="driverLapsRecharts" className="race-sidebar">
            <Link to="/analysis/driverLapsRecharts">Driver laps </Link>
          </Menu.Item>

          <Menu.Item key="carPitstops" className="race-sidebar">
            <Link to="/analysis/carPitstops">Pitstops</Link>
          </Menu.Item>
          <Menu.Item key="stintDurations" className="race-sidebar">
            <Link to="/analysis/stintDurations">Stint Durations</Link>
          </Menu.Item>
          <Menu.Item key="stintLaps" className="race-sidebar">
            <Link to="/analysis/stintLaps">Stint Laps</Link>
          </Menu.Item>
          <Menu.Item key="stintSummary" className="race-sidebar">
            <Link to="/analysis/stintSummary">Stint Summary</Link>
          </Menu.Item>
          <Menu.Item key="messages" className="race-sidebar">
            <Link to="/analysis/messages">Messages</Link>
          </Menu.Item>

          {API_LOCAL_DEV_MODE ? (
            <Menu.Item key="test" className="race-sidebar">
              <Link to="/analysis/test">test</Link>
            </Menu.Item>
          ) : (
            <></>
          )}
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path="/analysis/classification" component={Classification} />
          <Route path="/analysis/replayCOD" component={ReplayCircleOfDoomContainer} />

          <Route path="/analysis/raceGraphARecharts" component={RaceGraphContainer} />

          <Route path="/analysis/raceGraphBRecharts" component={RaceGraphByReferenceContainer} />

          <Route path="/analysis/racePositionsNivo" component={RacePositionsContainer} />
          <Route path="/analysis/dashboard" component={DashboardContainer} />

          <Route path="/analysis/driverLapsRecharts" component={DriverLapsContainer} />
          <Route path="/analysis/carPitstops" component={CarPitstopsContainer} />

          <Route path="/analysis/stintDurations" component={CarStintsContainer} />
          <Route path="/analysis/stintLaps" component={StintLapsContainer} />
          <Route path="/analysis/stintSummary" component={StintSummaryContainer} />
          <Route path="/analysis/messages" component={RaceMessages} />
          <Route path="/analysis/test" component={TestContainer} />
        </Switch>
      </Content>
    </Layout>
  );
};
