# Developer notes

## Nivo

There are some issues with tooltips in production mode.
Links:

- https://github.com/plouc/nivo/issues/1304
- https://github.com/plouc/nivo/issues/1290

A workaround for nivo@0.67 could be this:

Add this package.json

```
"resolutions": {
  "react-spring": "9.0.1"
}
```

run `yarn install` and the tooltips work in production like in development.
