// use-client.ts
import { DescService } from "@bufbuild/protobuf";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { createConnectTransport, createGrpcWebTransport } from "@connectrpc/connect-web";
import { useMemo } from "react";
import { globalWamp } from "../commons/globals";
import { API_GRPC_BINARY_FORMAT } from "../constants";

const credentialedFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    credentials: "include", // Include cookies in requests
  });
};
// This transport is going to be used throughout the app
const createTransport = () => {
  return API_GRPC_BINARY_FORMAT
    ? createGrpcWebTransport({
        baseUrl: globalWamp.backendConfig.grpc.url,
        fetch: credentialedFetch,
      })
    : createConnectTransport({
        baseUrl: globalWamp.backendConfig.grpc.url,
        fetch: credentialedFetch,
      });
};

/**
 * Get a callback client for the given service.
 */
export function useClient<T extends DescService>(service: T): CallbackClient<T> {
  // We memoize the client, so that we only create one instance per service.
  return useMemo(() => createCallbackClient(service, createTransport()), [service]);
}
