import { Layout, Menu } from "antd";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { Store } from "redux";
import "./App.css";
import RaceDetailsFrame from "./components/raceDetails";
import { AnalysisMainPage } from "./pages/analysisPage";
import { FakeLoaderPage } from "./pages/fakeLoader";
import LiveContent from "./pages/liveContent";
import { RaceEventListPage } from "./pages/raceEventListPage";
import { ApplicationState } from "./stores";

const { Header, Content, Footer } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}

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
                <Link to="/analysis">Analysis</Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/devloader">DevLoader</Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: "0 50px" }}>
            <div className="site-layout-content">
              <Switch>
                <Route exact path="/events">
                  <RaceEventListPage />
                </Route>
                <Route path="/live">
                  <LiveContent />
                </Route>
                <Route path="/analysis">
                  <AnalysisMainPage />
                </Route>
                <Route path="/devloader">
                  <FakeLoaderPage />
                </Route>
                <Route path="/events/details/:id" component={RaceDetailsFrame} />
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>iRacelog ©2021 Markus Papenbrock</Footer>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
