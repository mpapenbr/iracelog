import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { checkForExternalConfig } from "./commons/backend";
import { globalWamp } from "./commons/globals";
import configureStore from "./configureStore";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const initialState = window.INITIAL_REDUX_STATE;
const store = configureStore(initialState);

(async () => {
  const config = await checkForExternalConfig();
  // console.log(y);
  globalWamp.backendConfig = config;
  const container = document.getElementById("root");
  const root = createRoot(container!);
  // console.log("After sync");
  root.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
})();
