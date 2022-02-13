import { Layout } from "antd";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Store } from "redux";
import "./App.css";
import { API_LOCAL_DEV_MODE } from "./constants";
import { EventHeaderContainer } from "./container/EventHeaderContainer";
import { AnalysisMainPage } from "./pages/analysisPage";
import { DemoRaces } from "./pages/demoRaces";
import { FakeLoaderPage } from "./pages/fakeLoader";
import { ApplicationState } from "./stores";

const { Header, Content, Footer, Sider } = Layout;

interface AppProps {
  store: Store<ApplicationState>;
}

const OtherContent: React.FC = () => <div>Here goes other content</div>;

const App: React.FC<AppProps> = (props: AppProps) => {
  return (
    <Provider store={props.store}>
      <Router>
        <Layout className="layout">
          <Header>
            <EventHeaderContainer />
          </Header>

          <Content style={{ padding: "0 5px" }}>
            <div className="site-layout-content">
              <Routes>
                <Route path="/" element={<DemoRaces />} />
                <Route path="/events" element={<DemoRaces />} />

                <Route path="/analysis/:eventKey/*" element={<AnalysisMainPage />} />

                {API_LOCAL_DEV_MODE ? <Route path="/devloader" element={<FakeLoaderPage />} /> : <></>}
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>iRacelog ©2022 Markus Papenbrock</Footer>
        </Layout>
      </Router>
    </Provider>
  );
};

const FakeEvents = React;

export default App;
