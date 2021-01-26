import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Route, RouteComponentProps, Switch } from "react-router-dom";
import MyTry from "./myTry";
import PitStops from "./pitstops";
import RaceEntries from "./raceEntries";
import Stints from "./stints";

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
  const dispatch = useDispatch();

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
          <Menu.Item key="pitstops" className="race-sidebar">
            <Link to={`${match.url}/pitstops`}>Pitstop</Link>
          </Menu.Item>
          <Menu.Item key="summary" className="race-sidebar">
            <Link to={`${match.url}/summary`}>Summary</Link>
          </Menu.Item>
          <Menu.Item key="try" className="race-sidebar">
            <Link to={`${match.url}/try`}>Experimental</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <Switch>
          <Route path={`${match.url}`} exact component={MyPlaceholder} />
          <Route path={`${match.url}/try`} component={MyTry} />
          <Route path={`${match.url}/pitstops`} component={PitStops} />
          <Route path={`${match.url}/stints`} component={Stints} />
          <Route path={`${match.url}/entries`} component={RaceEntries} />
        </Switch>
      </Content>
    </Layout>
  );
}
export default RaceDetailsFrame;
