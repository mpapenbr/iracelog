// use-client.ts
import { DescService } from "@bufbuild/protobuf";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { createConnectTransport, createGrpcWebTransport } from "@connectrpc/connect-web";
import { useMemo } from "react";
import { globalWamp } from "../commons/globals";
import { API_GRPC_BINARY_FORMAT } from "../constants";

// This transport is going to be used throughout the app
const createTransport = () => {
  return API_GRPC_BINARY_FORMAT
    ? createGrpcWebTransport({
        baseUrl: globalWamp.backendConfig.grpc.url,
      })
    : createConnectTransport({ baseUrl: globalWamp.backendConfig.grpc.url });
};

/**
 * Get a callback client for the given service.
 */
export function useClient<T extends DescService>(service: T): CallbackClient<T> {
  // We memoize the client, so that we only create one instance per service.
  return useMemo(() => createCallbackClient(service, createTransport()), [service]);
}
