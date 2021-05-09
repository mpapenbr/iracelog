import { Layout, Menu } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import Classification from "../components/live/classification";
import RaceMessages from "../components/live/raceMessages";
import CarPitstopsNivo from "../components/nivo/carPitstops";
import CarStintsNivo from "../components/nivo/carStints";
import RacePositionGraphNivo from "../components/nivo/racePositionGraph";
import CarPitstopsRecharts from "../components/recharts/carPitstops";
import DriverLapsRecharts from "../components/recharts/driverLaps";
import RaceGraphByReferenceRecharts from "../components/recharts/raceGraphRelativeRecharts";
import StintLapsRecharts from "../components/recharts/stintLaps";
import { RaceGraphContainer } from "../container/RaceGraphContainer";

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
          <Menu.Item key="classification" className="race-sidebar">
            <Link to="/analysis/classification">Classification</Link>
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

          <Menu.Item key="driverLapsRecharts" className="race-sidebar">
            <Link to="/analysis/driverLapsRecharts">Driver laps </Link>
          </Menu.Item>

          <Menu.Item key="carPitstopsNivo" className="race-sidebar">
            <Link to="/analysis/carPitstopsNivo">Pitstops</Link>
          </Menu.Item>
          <Menu.Item key="stintDurations" className="race-sidebar">
            <Link to="/analysis/stintDurations">Stint Durations</Link>
          </Menu.Item>
          <Menu.Item key="stintLaps" className="race-sidebar">
            <Link to="/analysis/stintLaps">Stint Laps</Link>
          </Menu.Item>
          <Menu.Item key="messages" className="race-sidebar">
            <Link to="/analysis/messages">Messages</Link>
          </Menu.Item>
          <Menu.Item key="test" className="race-sidebar">
            <Link to="/analysis/test">test</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path="/analysis/classification" component={Classification} />

          <Route path="/analysis/raceGraphARecharts" component={RaceGraphContainer} />

          <Route path="/analysis/raceGraphBRecharts" component={RaceGraphByReferenceRecharts} />

          <Route path="/analysis/racePositionsNivo" component={RacePositionGraphNivo} />

          <Route path="/analysis/driverLapsRecharts" component={DriverLapsRecharts} />
          <Route path="/analysis/carPitstops" component={CarPitstopsRecharts} />
          <Route path="/analysis/carPitstopsNivo" component={CarPitstopsNivo} />
          <Route path="/analysis/stintDurations" component={CarStintsNivo} />
          <Route path="/analysis/stintLaps" component={StintLapsRecharts} />
          <Route path="/analysis/messages" component={RaceMessages} />
          <Route path="/analysis/test" component={RaceGraphContainer} />
        </Switch>
      </Content>
    </Layout>
  );
};
