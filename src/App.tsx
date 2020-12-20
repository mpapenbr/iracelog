import { Layout, Menu } from "antd";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { Store } from "redux";
import "./App.css";
import { RaceEventListPage } from "./pages/raceEventListPage";
import { ApplicationState } from "./stores";

const { Header, Content, Footer } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}

const LiveContent: React.FC<{}> = () => <div>Here goes live content</div>;
const OtherContent: React.FC<{}> = () => <div>Here goes other content</div>;

const App: React.FC<AppProps> = (props: AppProps) => {
  return (
    <Provider store={props.store}>
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
                  <RaceEventListPage />
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
    </Provider>
  );
};

export default App;
