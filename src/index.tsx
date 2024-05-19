import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { checkForExternalConfig } from "./commons/backend";
import { globalWamp } from "./commons/globals";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

(async () => {
  const config = await checkForExternalConfig();
  // console.log(y);
  globalWamp.backendConfig = config;
  const client = new ApolloClient({
    uri: globalWamp.backendConfig.graphql.url,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getEvents: {
              keyArgs: false,
              merge(existing = [], incoming) {
                return [...existing, ...incoming];
              },
            },
          },
        },
      },
    }),
  });
  const container = document.getElementById("root");
  const root = createRoot(container!);
  // console.log("After sync");
  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </React.StrictMode>,
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
})();
