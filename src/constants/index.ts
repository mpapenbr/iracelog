export const API_BASE_URL = import.meta.env.VITE_BASE_URL;
export const API_AUTH_URL = import.meta.env.VITE_AUTH_URL;
export const API_CROSSBAR_URL = import.meta.env.VITE_CROSSBAR_URL;
export const API_CROSSBAR_REALM = import.meta.env.VITE_CROSSBAR_REALM;
export const API_GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
export const API_GRPC_URL = import.meta.env.VITE_GRPC_URL;
export const API_GRPC_BINARY_FORMAT = import.meta.env.VITE_GRPC_BINARY_FORMAT;

export const API_LOCAL_DEV_MODE = import.meta.env.VITE_LOCAL_DEV_MODE || false;
export const APP_VERSION_RAW = import.meta.env.VITE_VERSION_RAW || "no version set";
export const APP_VERSION_DISPLAY = import.meta.env.VITE_VERSION_DISPLAY || "no version set";

export const API_AUTH_REALM = import.meta.env.VITE_AUTH_REALM || "pleaseConfigureRealm";
export const API_AUTH_CLIENT = import.meta.env.VITE_AUTH_CLIENT || "pleaseConfigureClient";
export const ACCESS_TOKEN = "accessToken";
export const EXT_LOAD_ID = "extLoadId";
export const SERVER_KEY = "servers"; //
