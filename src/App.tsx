import { Layout } from "antd";
import React from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Store } from "redux";
import "./App.css";
import { API_LOCAL_DEV_MODE, APP_VERSION_DISPLAY } from "./constants";
import { EventHeaderContainer } from "./container/EventHeaderContainer";
import { AnalysisMainPage } from "./pages/analysisPage";

import { Events } from "./pages/eventsPage";
import { FakeLoaderPage } from "./pages/fakeLoader";
import { ApplicationState, store } from "./stores";

const { Header, Content, Footer, Sider } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}
const OtherContent: React.FC = () => <div>Here goes other content</div>;

const App: React.FC<{}> = () => {
  const link = `https://github.com/mpapenbr/iracelog/releases/tag/v${APP_VERSION_DISPLAY}`;
  return (
    <Provider store={store}>
      <Router>
        <Layout className="layout">
          <Header style={{ background: "rgba(29, 34, 36, 0.835)", color: "azure" }}>
            <EventHeaderContainer />
          </Header>

          <Content style={{ padding: "0 5px" }}>
            <div className="site-layout-content">
              <Routes>
                <Route path="/" element={<Events />} />
                <Route path="/events" element={<Events />} />

                <Route path="/analysis/:eventKey/*" element={<AnalysisMainPage />} />

                {API_LOCAL_DEV_MODE ? (
                  <Route path="/devloader" element={<FakeLoaderPage />} />
                ) : (
                  <></>
                )}
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            iRacelog{" "}
            <a target={"_blank"} rel="noreferrer" href={link}>
              {APP_VERSION_DISPLAY}
            </a>{" "}
            ©2024 Markus Papenbrock
          </Footer>
        </Layout>
      </Router>
    </Provider>
  );
};

const FakeEvents = React;

export default App;
