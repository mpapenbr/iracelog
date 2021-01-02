import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Route, RouteComponentProps, Switch } from "react-router-dom";
import MyTry from "./myTry";

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
  useEffect(() => {
    // console.log("Now trigger load event details for " + match.params.id);
    //delegate();
    // dispatch(loadEventDrivers(match.params.id));
    // dispatch(loadEventData("tbd_token", match.params.id));
    // dispatch(ensureEventData("tbd_token_race_details", match.params.id));
  }, [loadTrigger]);
  return (
    <Layout>
      <Sider theme="light" width={200}>
        <Menu theme="light" mode="inline">
          <Menu.Item key="drivers" className="race-sidebar">
            <Link to={`${match.url}/drivers`}>Drivers</Link>
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
        </Switch>
      </Content>
    </Layout>
  );
}
export default RaceDetailsFrame;
