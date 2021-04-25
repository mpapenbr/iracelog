# Developer notes

## Own packages on Github

At the moment (2021-04-25) there is no way to get packages from github repository (https://npm.pkg.github.com) without using a personal access token (PAT).  
So we need to put one in place at `~/.npmrc` which looks like this

```
@mpapenbr:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<READ_ACCESS_TOKEN>
```

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

# Solved issues
