# Developer notes

## New version

**Precondition:** We want a new release on main. No changes apart from new version numbers (and/or changelog infos) should be made.

**Tasks:**

```
yarn version
```

This will increment that version number in `package.json`, run the tests and create a tag of the version with prefix `v`

## Own packages on Github

At the moment (2021-04-25) there is no way to get packages from github repository (https://npm.pkg.github.com) without using a personal access token (PAT).  
So we need to put one in place at `~/.npmrc` which looks like this

```
@mpapenbr:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<READ_ACCESS_TOKEN>
```

## antd charts

Seems to be pretty new so I'm sure some of the glitches are going to be fixed soon.  
For now:

- avoid using x-values as number. Use strings instead (https://github.com/ant-design/ant-design-charts/issues/797)
- boxplot-outliers (https://github.com/ant-design/ant-design-charts/issues/800)

# Solved issues

## Nivo

**FIXED with nivo@0.68**

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
