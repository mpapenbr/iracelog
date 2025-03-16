# iracelog

Webfrontend for iRacing race log data. See [iracelog-documentation](https://github.com/mpapenbr/iracelog-documentation) for an overview of further components.

A demo installation is available at https://iracelog.iracing-tools.de

## Docker

See https://github.com/mpapenbr/iracelog/pkgs/container/iracelog-web for a list of available images.

### Customize backend connection

The provided image uses the backend running at iracing-tools.de.

You may customize the image. Mapping a config file into the container is all you have to do.

The default configuration would look like

```
{
    "grpc": {
        "url": "https://grpc.iracing-tools.de"
    },
    "graphql": {
        "url": "https://graphql.iracing-tools.de/query"
    }
}
```

#### Example

Create a file `other-backend.json` and adjust the values according to your backend.

```
{
    "grpc": {
        "url": "<THE_GRPC_ENDPOINT>",        
    },
    "graphql": {
        "url": "<THE_GRAPHQL_QUERY_ENDPOINT>"
    }
}
```

Map the config file and start the container

```
docker run --rm -v $PWD/other-backend.json:/usr/share/nginx/html/config.json ghcr.io/mpapenbr/iracelog-web:<TAG>
```
