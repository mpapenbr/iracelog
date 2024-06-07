import { Button, ConfigProvider, Flex, Layout, Popover, ThemeConfig, theme } from "antd";
import React from "react";
import { Provider } from "react-redux";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Store } from "redux";
import "./App.css";
import { API_LOCAL_DEV_MODE, APP_VERSION_DISPLAY } from "./constants";
import { AnalysisMainPage } from "./pages/analysisPage";

import { SettingOutlined } from "@ant-design/icons";
import { GlobalSettings } from "./components/globalSettingsControl";
import { EventHeaderContainer } from "./container/EventHeaderContainer";
import { Events } from "./pages/eventsPage";
import { FakeLoaderPage } from "./pages/fakeLoader";
import { ApplicationState, store, useAppSelector } from "./stores";

const { Header, Content, Footer, Sider } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}
const OtherContent: React.FC = () => <div>Here goes other content</div>;

const HOCConfig = (props: any) => {
  const userSettings = useAppSelector((state) => state.userSettings.global);

  let t: ThemeConfig;
  switch (userSettings.theme) {
    case "dark":
      t = {
        algorithm: userSettings.useCompact
          ? [theme.darkAlgorithm, theme.compactAlgorithm]
          : [theme.darkAlgorithm],
      };

      break;
    case "dimmed":
      t = {
        algorithm: userSettings.useCompact
          ? [theme.darkAlgorithm, theme.compactAlgorithm]
          : [theme.darkAlgorithm],
        token: {
          colorBgBase: "#282525",
          colorTextBase: "#C4C4C4",
        },
      };
      break;
    case "light":
      t = {
        algorithm: userSettings.useCompact
          ? [theme.defaultAlgorithm, theme.compactAlgorithm]
          : [theme.defaultAlgorithm],
      };
      break;
  }

  // theme={{
  //   algorithm: [theme.defaultAlgorithm],
  // }}
  return <ConfigProvider theme={t}>{props.children}</ConfigProvider>;
};

const AppHeaderDiv: React.FC = () => {
  return (
    <Link to="/events">
      <div style={{ display: "flex", gap: "10px" }}>
        <h2 style={{ color: "azure", margin: 0 }}>iRacelog</h2>
        <h4 style={{ color: "azure", margin: 0 }}>v{APP_VERSION_DISPLAY}</h4>
      </div>
    </Link>
  );
};
const AppHeader: React.FC = () => {
  return (
    <>
      <h2 style={{ color: "azure" }}>iRacelog</h2>
      <h3 style={{ color: "azure", marginLeft: "10px" }}>v{APP_VERSION_DISPLAY}</h3>
    </>
  );
};

const AppSettings: React.FC = () => {
  return (
    <Popover content={<GlobalSettings />} title="Select columns">
      <Button icon={<SettingOutlined />} />
    </Popover>
  );
};

const App: React.FC<{}> = () => {
  const link = `https://github.com/mpapenbr/iracelog/releases/tag/v${APP_VERSION_DISPLAY}`;

  return (
    <Provider store={store}>
      <Router>
        <HOCConfig>
          <Layout
            className="layout"
            style={{ display: "flex", flexDirection: "column", height: "100vh" }}
          >
            <Header
              style={{
                background: "rgba(29, 34, 36, 0.835)",
                color: "azure",
                display: "flex",
                gap: "10px",
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              {true ? (
                <>
                  <div style={{}}>
                    <AppHeaderDiv />
                  </div>
                  <div style={{ flex: 10 }}>
                    <EventHeaderContainer />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <AppSettings />
                  </div>
                </>
              ) : (
                <>
                  <Flex align="start" justify="flex-start">
                    <Flex flex={1}>
                      <h2 style={{ color: "azure" }}>iRacelog</h2>
                    </Flex>
                    <Flex flex={9} align="start">
                      <EventHeaderContainer />
                    </Flex>
                  </Flex>
                </>
              )}
            </Header>
            <Content
              style={{
                padding: "0 5px",
              }}
            >
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
        </HOCConfig>
      </Router>
    </Provider>
  );
};

const FakeEvents = React;

export default App;
