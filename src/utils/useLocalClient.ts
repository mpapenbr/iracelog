// use-client.ts
import { DescService } from "@bufbuild/protobuf";
import { CallbackClient, createCallbackClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { useMemo } from "react";

// This transport is going to be used throughout the app
const createTransport = (url: string) => {
  // return API_GRPC_BINARY_FORMAT
  //   ? createGrpcWebTransport({
  //       baseUrl: url,

  //     })
  //   : createConnectTransport({ baseUrl: url });
  return createConnectTransport({
    baseUrl: url,
    // useHttpGet: true,
  });
};

/**
 * Get a callback client for the given service.
 */
export function useClient<T extends DescService>(url: string, service: T): CallbackClient<T> {
  // We memoize the client, so that we only create one instance per service.
  return useMemo(() => createCallbackClient(service, createTransport(url)), [service]);
}
