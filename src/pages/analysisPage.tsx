import { Layout, Menu } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import Classification from "../components/live/classification";
import RacePositionGraph from "../components/live/racePositionGraph";
import StintLaps from "../components/live/stintLaps";
import CarPitstopsNivo from "../components/nivo/carPitstops";
import CarStintsNivo from "../components/nivo/carStints";
import RacePositionGraphNivo from "../components/nivo/racePositionGraph";
import CarPitstopsRecharts from "../components/recharts/carPitstops";
import DriverLapsRecharts from "../components/recharts/driverLaps";
import RaceGraphRecharts from "../components/recharts/raceGraphRecharts";
import RaceGraphByReferenceRecharts from "../components/recharts/raceGraphRelativeRecharts";

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
          {/* <Menu.Item key="test" className="race-sidebar">
            <Link to="test">test</Link>
          </Menu.Item> */}
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path="/analysis/classification" component={Classification} />

          <Route path="/analysis/raceGraphARecharts" component={RaceGraphRecharts} />

          <Route path="/analysis/raceGraphBRecharts" component={RaceGraphByReferenceRecharts} />
          <Route path="/analysis/racePositions" component={RacePositionGraph} />
          <Route path="/analysis/racePositionsNivo" component={RacePositionGraphNivo} />

          <Route path="/analysis/driverLapsRecharts" component={DriverLapsRecharts} />
          <Route path="/analysis/carPitstops" component={CarPitstopsRecharts} />
          <Route path="/analysis/carPitstopsNivo" component={CarPitstopsNivo} />
          <Route path="/analysis/stintDurations" component={CarStintsNivo} />
          <Route path="/analysis/stintLaps" component={StintLaps} />
          <Route path="/analysis/test" component={OtherContent} />
        </Switch>
      </Content>
    </Layout>
  );
};
