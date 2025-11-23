import {
  Button,
  ConfigProvider,
  Flex,
  Layout,
  Menu,
  MenuProps,
  Popover,
  ThemeConfig,
  theme,
} from "antd";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { Store } from "redux";
import "./App.css";
import { API_LOCAL_DEV_MODE, APP_VERSION_DISPLAY } from "./constants";
import { AnalysisMainPage } from "./pages/analysisPage";

import {
  DashboardOutlined,
  DatabaseOutlined,
  InfoOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AuthService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/auth/v1/auth_service_pb";
import { SettingsService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/settings/v1/settings_service_pb";
import { UserService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/user/v1/user_service_pb";
import { Code } from "@connectrpc/connect";
import { UserAuthComponentMainMenu } from "./components/auth/userAuthMenu";
import { GlobalSettings } from "./components/globalSettingsControl";
import Classification from "./components/live/classification";
import { EventHeaderContainer } from "./container/EventHeaderContainer";
import { About } from "./pages/aboutPage";
import { Events } from "./pages/eventsPage";
import { FakeLoaderPage } from "./pages/fakeLoader";
import { Racelogger } from "./pages/raceloggerPage";
import { Search } from "./pages/searchPage";
import { ApplicationState, store, useAppDispatch, useAppSelector } from "./stores";
import { updateLoginSupport } from "./stores/grpc/slices/serverSettingsSlice";
import { resetUserInfo, updateUserInfo } from "./stores/grpc/slices/userInfoSlice";
import { useClient } from "./utils/useClient";

const { Header, Content, Footer, Sider } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}
const OtherContent: React.FC = () => <div>Here goes other content</div>;

const HOCConfig = (props: any) => {
  const userSettings = useAppSelector((state) => state.userSettings.global);
  const serverSettings = useAppSelector((state) => state.serverSettings);

  const cbSettingsClient = useClient(SettingsService);
  const cbUserClient = useClient(UserService);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const dispatch = useAppDispatch();

  useEffect(() => {
    cbSettingsClient.getServerSettings({}, (err, res) => {
      if (err != undefined) {
        console.log(err);
        return;
      }
      console.log("getServerSettings called", res);
      dispatch(updateLoginSupport(res.supportsLogin));
    });
  }, [loadTrigger]);

  if (serverSettings.supportsLogins) {
    cbUserClient.getUserInfo({}, (err, res) => {
      if (err != undefined) {
        if (err.code === Code.Unauthenticated) {
          // not logged in
          dispatch(resetUserInfo());
          return;
        }
        console.log("getUserInfo error", err);
        return;
      }
      console.log("getUserInfo called", res);
      dispatch(updateUserInfo(res.userInfo!));
    });
  }
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
    default:
      t = {
        algorithm: userSettings.useCompact
          ? [theme.defaultAlgorithm, theme.compactAlgorithm]
          : [theme.defaultAlgorithm],
      };
      break;
  }
  t.zeroRuntime = false;
  // theme={{
  //   algorithm: [theme.defaultAlgorithm],
  // }}
  return <ConfigProvider theme={t}>{props.children}</ConfigProvider>;
};

const AppMenu: React.FC = () => {
  const serverSettings = useAppSelector((state) => state.serverSettings);
  const navigate = useNavigate();
  const location = useLocation();
  const cbAuthClient = useClient(AuthService);
  const dispatch = useAppDispatch();
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  const onLogin = () => {
    cbAuthClient.login(
      {
        // { externalId: globalWamp.backendConfig.tenant.id },
        // redirectUrl: window.location.href,
        redirectUrl: window.location.href,
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("login called", res);
        window.location.href = res.loginUrl;
        // setData({ events: res.getEventsList() });
      },
    );
  };
  const onLogout = () => {
    // Implement logout logic here
    console.log("Logout clicked");
    cbAuthClient.logout(
      {
        // { externalId: globalWamp.backendConfig.tenant.id },
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("logout called", res);
        dispatch(resetUserInfo());
        // window.location.href = res.logoutUrl;

        // setData({ events: res.getEventsList() });
      },
    );
  };

  const items: MenuProps["items"] = [
    {
      key: "/events",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/search",
      icon: <SearchOutlined />,
      label: "Search",
    },

    {
      key: "quicksettings",
      icon: <SettingOutlined />,
      label: (
        <Popover
          content={<GlobalSettings />}
          title="Settings"
          trigger="click"
          open={settingsPopoverOpen}
          onOpenChange={setSettingsPopoverOpen}
        >
          <span>Settings</span>
        </Popover>
      ),
    },
    {
      key: "/racelogger",
      icon: <DatabaseOutlined />,
      label: "Racelogger",
    },
    {
      key: "/about",
      icon: <InfoOutlined />,
      label: "About",
    },
  ];

  const handleClick: MenuProps["onClick"] = (e) => {
    // Don't navigate if it's the settings menu item
    if (e.key === "quicksettings") {
      e.domEvent.preventDefault();
      setSettingsPopoverOpen(!settingsPopoverOpen);
      return;
    }
    navigate(e.key);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={handleClick}
        style={{ flex: 1, minWidth: 0, background: "transparent" }}
      />
      {serverSettings.supportsLogins === true ? (
        <UserAuthComponentMainMenu onLogin={onLogin} onLogout={onLogout} />
      ) : (
        <></>
      )}
    </div>
  );
};

const AppHeaderDiv: React.FC = () => {
  return (
    <Link to="/events">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <h2 style={{ color: "azure", margin: 0, lineHeight: "1.2" }}>iRacelog</h2>
        <div
          style={{
            color: "azure",
            margin: 0,
            fontSize: "0.75rem",
            lineHeight: "1",
            opacity: 0.8,
          }}
        >
          v{APP_VERSION_DISPLAY}
        </div>
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
          <Layout className="layout" style={{ minHeight: "100vh" }}>
            <Header
              style={{
                background: "rgba(29, 34, 36, 0.835)",
                color: "azure",

                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "5px",
                height: "auto",
                lineHeight: "normal",
              }}
            >
              {true ? (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <AppMenu />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      paddingTop: "10px",
                    }}
                  >
                    {/* <div style={{}}>
                      <AppHeaderDiv />
                    </div> */}
                    <div style={{ flex: 10 }}>
                      <EventHeaderContainer />
                    </div>
                    {/* <div style={{ textAlign: "center" }}>
                      <AppSettings />
                    </div> */}
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
                flex: 1,
              }}
            >
              <div className="site-layout-content">
                <Routes>
                  <Route path="/" element={<Events />} />
                  <Route path="/racelogger" element={<Racelogger />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/about" element={<About />} />

                  <Route path="/analysis/:eventKey">
                    <Route path="*" element={<AnalysisMainPage />} />
                    <Route index element={<Classification />} />
                  </Route>

                  {API_LOCAL_DEV_MODE ? (
                    <Route path="/devloader" element={<FakeLoaderPage />} />
                  ) : (
                    <></>
                  )}
                </Routes>
              </div>
            </Content>
            <Footer style={{ textAlign: "center", marginTop: "auto" }}>
              iRacelog{" "}
              <a target={"_blank"} rel="noreferrer" href={link}>
                {APP_VERSION_DISPLAY}
              </a>{" "}
              ©2025 Markus Papenbrock
            </Footer>
          </Layout>
        </HOCConfig>
      </Router>
    </Provider>
  );
};

const FakeEvents = React;

export default App;
