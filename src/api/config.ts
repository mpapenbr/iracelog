/**
 * defines the structure for config.json
 */
export interface Config {
  graphql: {
    url: string;
  };
  grpc: {
    url: string;
  };
  tenant: {
    id: string;
  };
}
