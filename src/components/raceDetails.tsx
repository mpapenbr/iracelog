import { Layout, Menu, Tooltip } from "antd";
import React, { useState } from "react";
import { Link, Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import GapProgression from "./gapProgSelect";
import MyTry from "./myTry";
import PitStops from "./pitstops";
import RaceEntries from "./raceEntries";
import Stints from "./stints";
import StintCompare from "./stintSelectCompare";

const { Header, Sider, Content } = Layout;

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

function MyPlaceholder() {
  return <div>Nothing</div>;
}

type TParams = { id: string };
function RaceDetailsFrame({ match }: RouteComponentProps<TParams>) {
  const [loadTrigger, setLoadTrigger] = useState(0);

  return (
    <Layout>
      <Sider theme="light" width={200}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="drivers" className="race-sidebar">
            <Link to={`${match.url}/entries`}>Entries</Link>
          </Menu.Item>
          <Menu.Item key="stints" className="race-sidebar">
            <Link to={`${match.url}/stints`}>Stints</Link>
          </Menu.Item>
          <Menu.Item key="stintCompare" className="race-sidebar">
            <Link to={`${match.url}/compareStints`}>Compare stints</Link>
          </Menu.Item>
          <Menu.Item key="gapProgression" className="race-sidebar">
            <Link to={`${match.url}/gapProgression`}>Gap progression</Link>
          </Menu.Item>
          <Menu.Item key="pitstops" className="race-sidebar">
            <Tooltip title="Very work in progress!">
              <Link to={`${match.url}/pitstops`}>Pitstop </Link>
            </Tooltip>
          </Menu.Item>
          {/* <Menu.Item key="summary" className="race-sidebar">
            <Link to={`${match.url}/summary`}>Summary</Link>
          </Menu.Item> */}
          <Menu.Item key="try" className="race-sidebar">
            <Tooltip title="Actual content: Race standings by second. Work in progress - not very end user friendly">
              <Link to={`${match.url}/try`}>Experimental</Link>
            </Tooltip>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path={`${match.url}`} exact>
            <Redirect to={`${match.url}/entries`} />
          </Route>
          <Route path={`${match.url}/try`} component={MyTry} />
          <Route path={`${match.url}/pitstops`} component={PitStops} />
          <Route path={`${match.url}/stints`} component={Stints} />
          <Route path={`${match.url}/compareStints`} component={StintCompare} />
          <Route path={`${match.url}/gapProgression`} component={GapProgression} />
          <Route path={`${match.url}/entries`} component={RaceEntries} />
        </Switch>
      </Content>
    </Layout>
  );
}
export default RaceDetailsFrame;
