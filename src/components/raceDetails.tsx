import { Layout, Menu } from "antd";
import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

const { Header, Sider, Content } = Layout;

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

type TParams = { id: string };

function RaceDetailsFrame({ match }: RouteComponentProps<TParams>) {
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
        </Menu>
      </Sider>
      <Content>Content</Content>
    </Layout>
  );
}
export default RaceDetailsFrame;
