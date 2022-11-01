/**
 * defines the structure for config.json
 */
export interface Config {
  crossbar: {
    url: string;
    realm: string;
  };
  graphql: {
    url: string;
  };
}
