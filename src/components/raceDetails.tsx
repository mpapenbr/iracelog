import { Layout } from "antd";
import React from "react";
import { RouteComponentProps } from "react-router-dom";

const { Header, Sider, Content } = Layout;

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

type TParams = { id: string };

function RaceDetailsFrame({ match }: RouteComponentProps<TParams>) {
  console.log("Piep");
  return (
    <Layout>
      <Sider>Sider content</Sider>
      <Content>Content</Content>
    </Layout>
  );
}
export default RaceDetailsFrame;
