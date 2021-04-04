import { Layout, Menu } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import CarPitstops from "../components/live/carPitstops";
import DriverLaps from "../components/live/driverLaps";
import RaceGraph from "../components/live/raceGraph";
import RaceGraphByReference from "../components/live/raceGraphRelative";
import RacePositionGraph from "../components/live/racePositionGraph";
import StintDuration from "../components/live/stintDuration";
import StintLaps from "../components/live/stintLaps";
import RaceGraphRecharts from "../components/recharts/raceGraphRecharts";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

const { Header, Sider, Content } = Layout;

const OtherContent: React.FC<{}> = () => <div>Here goes other content</div>;

export const AnalysisMainPage: React.FC<MyProps> = (props: MyProps) => {
  return (
    <Layout>
      <Sider theme="light" width={200}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="raceGraphA" className="race-sidebar">
            <Link to="/analysis/raceGraphA">Race graph A (victory)</Link>
          </Menu.Item>
          <Menu.Item key="raceGraphARecharts" className="race-sidebar">
            <Link to="/analysis/raceGraphARecharts">Race graph A (recharts)</Link>
          </Menu.Item>
          <Menu.Item key="raceGraphB" className="race-sidebar">
            <Link to="/analysis/raceGraphB">Race graph B</Link>
          </Menu.Item>
          <Menu.Item key="racePositions" className="race-sidebar">
            <Link to="/analysis/racePositions">Race positions</Link>
          </Menu.Item>
          <Menu.Item key="driverLaps" className="race-sidebar">
            <Link to="/analysis/driverLaps">Driver laps</Link>
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
          <Menu.Item key="test" className="race-sidebar">
            <Link to="test">test</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path="/analysis/raceGraphA" component={RaceGraph} />
          <Route path="/analysis/raceGraphARecharts" component={RaceGraphRecharts} />
          <Route path="/analysis/raceGraphB" component={RaceGraphByReference} />
          <Route path="/analysis/racePositions" component={RacePositionGraph} />
          <Route path="/analysis/driverLaps" component={DriverLaps} />
          <Route path="/analysis/carPitstops" component={CarPitstops} />
          <Route path="/analysis/stintDurations" component={StintDuration} />
          <Route path="/analysis/stintLaps" component={StintLaps} />
          <Route path="/analysis/test" component={OtherContent} />
        </Switch>
      </Content>
    </Layout>
  );
};
