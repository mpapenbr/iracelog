import { Config } from "../api/config";
import { API_GRAPHQL_URL, API_GRPC_URL, API_TENANT_ID } from "../constants";

const backendConfig: Config = {
  graphql: { url: API_GRAPHQL_URL ?? "API_GRAPHQL_URL" },
  grpc: { url: API_GRPC_URL ?? "API_GRPC_URL" },
  tenant: { id: API_TENANT_ID ?? "API_TENANT_ID" },
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
