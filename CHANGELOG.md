### 0.18.0 (2022-11-26)

##### Build System / Dependencies

* **deps:**
  *  bump loader-utils from 2.0.3 to 2.0.4 (fb00e412)
  *  minor updates (6cbf9b16)
  *  recharts 2.1.16 (f426c1d3)
*  Bump to Node 18, adjusted some github actions (d6ab7ef4)
* **deps-dev:**  minor devDeps changes (b7651de7)

##### Chores

*  removed wamp store (92d7d252)
*  moved wamp store functions to raceData (93f43a62)
*  moved baseData store functions to ui, removed demoRaces (7a67962f)
*  removed old ui store actions (54d2f286)
*  removed raceevents from redux (#551) (455a0532)
*  cleanup devcontainer dockerfile (d3f4c3f4)

##### New Features

*  include speedmap data when replaying events (159b16ea)
*  Bigger Cicle of doom #337 (6f00e319)
*  use colors for cars with state out,pit,slow (#548) (00dea60b)
*  reworked events page #536 (bad9b7eb)

##### Bug Fixes

*  changed autobahn.Connection usage (4fb8187e)

##### Other Changes

*  udpated backend configuration (cb12a26c)

#### 0.17.1 (2022-10-22)

##### Build System / Dependencies

* **deps:**
  *  updated deps+devdeps (0e2f1cff)
  *  bump util from 0.12.4 to 0.12.5 (8671cde7)

##### Bug Fixes

*  handle events without raceloggerVersion (3613a20e)

### 0.17.0 (2022-10-16)

##### Build System / Dependencies

*  dependency updates (c6ebe49e)
* **devdeps:**
  *  eslint + companions (a6ec639d)
  *  typescript 4.8.3 (3b10268b)
* **deps:**
  *  antd 4.23.2, nivo 0.80.0, react-router 6.4.0, web-vitals 3.0.2 (9198b224)
  *  bump antd from 4.22.6 to 4.22.7 (06af0b66)
  *  bump redux-saga from 1.2.0 to 1.2.1 (20e1a00b)
  *  antd 4.22,6, redux-saga 1.2.0, dev-deps changes (b6011f21)
  *  antd 4.22,2, ant-design/charts 1.4.2, recharts 2.1.13,  minor dev-deps changes (05f343d7)
  *  bump moment from 2.29.3 to 2.29.4 (4c375424)
  *  bump antd from 4.21.3 to 4.21.7 (e9dce234)
  *  bump terser from 5.14.1 to 5.14.2 (1aadc22b)
  *  bump antd from 4.20.7 to 4.21.0 (09e9c735)
* **deps-dev:**
  *  bump @types/lodash from 4.14.183 to 4.14.184 (db8ffa92)
  *  bump @typescript-eslint/parser from 5.27.0 to 5.27.1 (98e5aab4)
  *  bump @typescript-eslint/eslint-plugin (e2d15f4a)
  *  bump eslint from 8.16.0 to 8.17.0 (0fba9543)
  *  bump @types/jest from 28.1.0 to 28.1.1 (4bae8e53)
  *  bump typescript from 4.7.2 to 4.7.3 (dea71c73)
  *  bump @types/react from 18.0.10 to 18.0.12 (8cfd1189)
* **dev-deps:**
  *  several deps + dev-deps upgraded (88a80229)
  *  severall deps + dev-deps upgraded (58dab26f)

##### Chores

*  dev-env updated (ef9bdbbd)
*  safeguard to make compiler happy !minor (b3da4620)

##### New Features

*  show speedmap + raceentries only for racelogger >= 0.4.3 (0d65a99c)
*  Extended event info page #521 (5bc0339c)
*  Extended event info page #521 (53bae0d9)
*  Speedmap (#522) (552611a1)
*  adjustments for racelogger 0.5.0 (fbc2f5d1)

##### Bug Fixes

*  adjusted topic (ec83c68f)

#### 0.16.3 (2022-05-22)

##### Build System / Dependencies

* **deps:**
  *  iracelog-analysis 1.1.3 (09efb39f)
  *  antd 4.20.5, recharts 2.1.10 + some dev-deps (aedf5947)

#### 0.16.2 (2022-05-16)

#### 0.16.1 (2022-05-16)

### 0.16.0 (2022-05-16)

##### Build System / Dependencies

* **deps-dev:**
  *  bump @typescript-eslint/eslint-plugin (89aa83df)
  *  bump @typescript-eslint/parser from 5.21.0 to 5.22.0 (c27b9684)
  *  bump @types/jest from 27.4.1 to 27.5.0 (63d0fa25)
  *  bump @testing-library/react from 13.1.1 to 13.2.0 (b8929164)
  *  bump ts-jest from 27.1.4 to 28.0.2 (e467f8ef)
  *  bump eslint from 8.14.0 to 8.15.0 (73f5213d)
  *  bump @types/react from 18.0.8 to 18.0.9 (d04add11)
* **deps:**
  *  bump antd from 4.20.2 to 4.20.3 (717af2e9)
  *  bump antd from 4.20.1 to 4.20.2 (0838d260)

##### Chores

*  updated .gitignore (79874c2a)
*  dependabot changed to weekly (fc529903)

##### New Features

*  Display current version in footer !minor (1421f96b)

##### Bug Fixes

*  processing of delta states for cars on change from PARADE to GREEN (e562d2ad)

#### 0.15.2 (2022-05-01)

##### Build System / Dependencies

* **chore:**  temp remove disturbing yarn.lock (294bfb38)
* **deps:**
  *  react 18.1.0, antd 4.20.1 (5e820060)
  *  react 18 preparations (4fcaf1a8)

##### Chores

* **git:**
  *  restored yarn.lock (5e1f083a)
  *  Merge branch 'mpapenbr/issue338' into main (4f75007e)
  *  Merge branch 'main' into mpapenbr/issue338 (1e63f838)
*  .gitignore (169108f0)

##### New Features

*  InputNumber adjustments. Label and/or units now outside of input (8640871b)

#### 0.15.1 (2022-04-22)

##### Build System / Dependencies

* **deps:**
  *  redux 4.2.0, react-redux 8.0.1 (1ffb06bd)
  *  bump moment from 2.29.1 to 2.29.2 (60f827e5)
  *  iracelog-analysis 1.1.2 (31a24424)
  *  bump react-redux from 7.2.7 to 7.2.8 (c318cfb3)
  *  bump antd from 4.19.4 to 4.19.5 (fb51eaa7)
  *  bump react-redux from 7.2.6 to 7.2.7 (6c8a9619)
  *  bump react-router-dom from 6.2.2 to 6.3.0 (5510adb0)
  *  bump antd from 4.19.3 to 4.19.4 (ec67a705)
  *  bump @ant-design/charts from 1.3.5 to 1.3.6 (1135759c)
  *  bump antd from 4.19.2 to 4.19.3 (eb4ab6e4)
  *  bump antd from 4.19.1 to 4.19.2 (6a92038d)
* **dev-deps:**  lodash 4.14.182, eslint/* 5.20.0 (51926a68)
* **deps-dev:**
  *  various fixes/minor updates (80cbc5c5)
  *  bump @testing-library/jest-dom from 5.16.3 to 5.16.4 (4a1471b9)
  *  bump @typescript-eslint/eslint-plugin (e7c4737c)
  *  bump @typescript-eslint/parser from 5.17.0 to 5.18.0 (0141703e)
  *  bump @testing-library/user-event from 14.0.3 to 14.0.4 (770ba30b)
  *  bump @testing-library/react from 12.1.4 to 13.0.0 (63f7bde5)
  *  bump @testing-library/user-event from 14.0.0 to 14.0.3 (e723da6e)
  *  bump @testing-library/user-event from 13.5.0 to 14.0.0 (af93cc3d)
  *  bump @types/lodash from 4.14.180 to 4.14.181 (c79ab7d6)
  *  bump @typescript-eslint/parser from 5.16.0 to 5.17.0 (928dcb02)
  *  bump @typescript-eslint/eslint-plugin (dbfafc0d)
  *  bump eslint from 8.11.0 to 8.12.0 (349c4c3d)
  *  bump typescript from 4.6.2 to 4.6.3 (a7e5f01e)
  *  bump @types/react from 17.0.42 to 17.0.43 (cf730cce)
  *  bump ts-jest from 27.1.3 to 27.1.4 (77f5ee5e)
  *  bump @testing-library/jest-dom from 5.16.2 to 5.16.3 (51ad1a65)
  *  bump @types/react from 17.0.41 to 17.0.42 (1cade547)
  *  bump @typescript-eslint/parser from 5.15.0 to 5.16.0 (a0e18d63)
  *  bump @typescript-eslint/eslint-plugin (3bdac10a)
  *  bump @types/react-dom from 17.0.13 to 17.0.14 (dd39a9ae)
  *  bump @types/react from 17.0.40 to 17.0.41 (46c941ee)
  *  bump eslint-plugin-react from 7.29.3 to 7.29.4 (bed53356)

##### Bug Fixes

* **security:**  override modules with security issues (0e8caf81)

### 0.15.0 (2022-03-17)

##### Build System / Dependencies

* **dev-deps:**  typescript-eslint (86cdf5b6)
* **deps:**  antd 4.19.1, minor dev-deps updates (b8cc8938)

##### Chores

*  access docker network from devcontainer (50bfeba3)

##### New Features

* **gui:**
  *  improved selection for pit stop in circle of doom (c9a7292a)
  *  zoom view for pitstop car in circle of doom (a72ed6f4)

### 0.14.0 (2022-03-06)

##### Build System / Dependencies

* **deps:**
  *  typescript 4.6.2,  smaller dev-deps changes (8effd826)
  *  antd 4.18.8, some types in devDeps updated (3a61c1a3)
* **deps-dev:**  eslint 8.10.0 (3eb46f2f)

##### New Features

* **gui:**
  *  ordering of car entries in filter (num vs race position)  in race graphs (d4385b98)
  *  ordering of car entries in filter (num vs race position)  in stints, pitstops (d50a9f3c)
  *  ordering of car entries in filter (num vs race position)  in dashboard, circle of doom, strategy (ff12d7a6)
  *  ordering of car entries in filter (num vs race position) (0dd40b39)
  *  settings page (e08bdf8c)

##### Bug Fixes

*  use session manifest from event data (c5301a95)

### 0.13.0 (2022-02-20)

##### Build System / Dependencies

* **deps:**
  *  antd 4.18.7, typescript-eslint 5.12.0 (27111e28)
  *  bump follow-redirects from 1.14.7 to 1.14.8 (#239) (92e7b6dd)
* **deps-dev:**  bump eslint from 8.8.0 to 8.9.0 (9ebb4163)

##### New Features

* **gui:**
  *  use only last X laps in delta graph(s) when in live mode (81eddac3)
  *  strategy overview (60990bdf)
  *  customizable show last X laps in live mode (fcb5c65e)
  *  use antd-charts for driver laps (f0aa8f97)
  *  use same colors for graphs Fixes #240 (77c0e33e)

### 0.12.0 (2022-02-13)

##### Build System / Dependencies

* **deps:**
  *  recharts 2.1.9, antd 4.18.6, typescript-eslint 5.11.0 (7f1f8bfe)
  *  adaptions to react-router v6 (0c021bbd)
  *  devdeps upgraded (40eaa9ce)
  *  nivo 0.79.1, antd charts 1.3.5, antd 4.18.5, ts 4.5.5 (034889b1)
  *  bump nanoid from 3.1.30 to 3.2.0 (#217) (528b0e5b)
  *  bump follow-redirects from 1.14.6 to 1.14.7 (#208) (4ff3ad3f)
  *  bump antd from 4.18.2 to 4.18.3 (#201) (db3de448)
  *  antd-charts 1.3.4, antd 4.18.2, nivo 0.78 (ea83a910)
  *  needed when moving from webpack 4 to 5 (f9928829)
  *  Update dependencies - nivo to 0.75 - antd to 4.18.0 - antd-charts to 1.3.3 - various eslint/react deps + additional to get this all working again Fixes #174 (deeb15c0)
* **deps-dev:**
  *  bump @typescript-eslint/eslint-plugin (#199) (8fc926e1)
  *  bump @typescript-eslint/parser from 5.9.0 to 5.9.1 (#200) (c83c3bc6)

##### New Features

* **layout:**  session info moved to header Fixes #23 (96ecc7b8)
* **routing:**
  *  reworked menus (8ce07fe2)
  *  external links preparations (b48918a2)

#### 0.11.1 (2021-12-03)

##### Build System / Dependencies

* **deps-dev:**  bump @types/node from 16.11.10 to 16.11.11 (#128) (9a9949fc)

##### Bug Fixes

*  event data for live events (a7afc310)

##### Other Changes

* mpapenbr/iracelog into main (feb7d0bc)

### 0.11.0 (2021-11-28)

##### Build System / Dependencies

* **deps:**
  *  bump dns-packet from 1.3.1 to 1.3.4 (#126) (50b49f16)
  *  bump ws from 6.2.1 to 6.2.2 (#124) (3f6df59c)
  *  bump url-parse from 1.5.1 to 1.5.3 (#125) (363ad2dd)
  *  bump tmpl from 1.0.4 to 1.0.5 (#121) (2a820e7c)
  *  bump path-parse from 1.0.6 to 1.0.7 (#122) (dc45e13b)
  *  bump tar from 6.1.0 to 6.1.11 (#123) (ab879ad6)
  *  minor @types updates (dd03096f)
  *  antd 4.17.2, ant-design charts 1.3.1 (92b7551f)
  *  bump typescript 4.5.2 (0300bcda)

##### Chores

*  update dependabot.yml (4ce04fc4)

##### Documentation Changes

*  how to customzie docker container (64263237)

##### New Features

*  adapt to new wamp endpoints (27d28418)

##### Bug Fixes

*  id mapping for loaded events (573a8415)
*  unique tooltip key for stretch (afa43544)

### 0.10.0 (2021-10-31)

##### Build System / Dependencies

* **deps:**
  *  bumped some deps (3d93a9a5)
  *  bumped nivo + testdep (397f0801)
  *  bumped several packages (9f4742e5)
* **tsconfig:**  es2020 + create-react-app reference (3b7677e0)
*  Bump antdesign/charts 1.2.13 (#74) (8fec775f)

##### Chores

*  updated manifest (49e41a9a)
*  remove no longer used files (724d77a3)
*  dependabot config (44814f40)
*  default shell zsh (51cec51e)
*  bump antdesign/charts 1.2.11, iracelog-analysis 1.1.1 (896e32b2)
*  dev doc + generate-changelog dep (e992e3de)
* **eslint:**  eslint configuration (e362de9d)
* **vsc:**  targets for debugging (47b01591)

##### New Features

*  Customizable url for backend  #84 (82e4e6de)

##### Bug Fixes

* **test:**  let instead of var (a150e0ef)

##### Other Changes

* mpapenbr/iracelog into main (679f0171)

##### Refactors

* **eslint:**  major linter erorrs fixed (be4a78b3)

#### 0.9.21 (2021-08-31)

##### Chores

*  Testmessage (11d334a6)

##### Continuous Integration

*  github release (8e7a0c77)

##### Other Changes

*  release test (13fede2e)

#### 0.9.20 (2021-08-31)

Beginning of changelogs
