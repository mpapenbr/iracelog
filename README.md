# iracelog

Webfrontend for iRacing race log data

## Docker

See https://github.com/mpapenbr/iracelog/pkgs/container/iracelog-web for a list of available images.

### Customize backend connection

The provided image uses the backend running at iracing-tools.de.

You may customize the image. Mapping a config file into the container is all you have to do.

The default configuration would look like

```
{
    "crossbar": {
        "url": "wss://crossbar.iracing-tools.de/ws",
        "realm": "racelog"
    }
}
```

#### Example

Create a file `other-backend.json` and adjust the values according to your backend.

```
{
    "crossbar": {
        "url": "<THE_CROSSBAR_WEBSOCKET_ENDPOINT>",
        "realm": "<THE_RACELOG_CROSSBAR_REALM>"
    }
}
```

Map the config file and start the container

```
docker run --rm -v $PWD/other-backend.json:/usr/share/nginx/html/config.json ghcr.io/mpapenbr/iracelog-web:<TAG>
```
