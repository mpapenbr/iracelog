import { Layout, Menu } from "antd";
import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";

const { Header, Content, Footer } = Layout;

const EventList: React.FC<{}> = () => <div>EventList</div>;
const LiveContent: React.FC<{}> = () => <div>Here goes live content</div>;
const OtherContent: React.FC<{}> = () => <div>Here goes other content</div>;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1">
              <Link to="/events">Events</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/live">Live</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/other">Other</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <div className="site-layout-content">
            <Switch>
              <Route path="/events">
                <EventList />
              </Route>
              <Route path="/live">
                <LiveContent />
              </Route>
              <Route path="/other">
                <OtherContent />
              </Route>
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>iRacelog ©2020 Markus Papenbrock</Footer>
      </Layout>
    </Router>
  );
}

export default App;
