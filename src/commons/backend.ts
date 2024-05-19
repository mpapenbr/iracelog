import { Config } from "../api/config";
import { API_CROSSBAR_URL, API_GRAPHQL_URL, API_GRPC_URL } from "../constants";

const backendConfig: Config = {
  crossbar: { url: API_CROSSBAR_URL ?? "API_CROSSBAR_URL", realm: "racelog" },
  graphql: { url: API_GRAPHQL_URL ?? "API_GRAPHQL_URL" },
  grpc: { url: API_GRPC_URL ?? "API_GRPC_URL" },
};
export const checkForExternalConfig = async () => {
  // console.log("checking for config.json");
  const res = await fetch("config.json");
  if (res.ok) {
    const contentType = res.headers.get("Content-Type");
    console.log(contentType);
    if (contentType?.startsWith("application/json")) {
      const cfg = await res.json();
      return cfg as Config;
    }
  }
  return backendConfig;
};

export default backendConfig;
