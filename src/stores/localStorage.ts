import { IGlobalSettings, IPersistedSettings, IRaceloggerSettings } from "./grpc/slices/types";

const LS_USER_SETTINGS = "iRacelogUserSettings";
const LS_RACELOGGER_SETTINGS = "raceloggerSettings";
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

export const loadSettings = () => {
  try {
    const serialized = localStorage.getItem(LS_USER_SETTINGS);
    if (!serialized) {
      return undefined;
    }
    return JSON.parse(serialized);
  } catch (e) {
    console.warn("Failed to load settings from localStorage", e);
    return undefined;
  }
};
export const saveSettings = (settings: IGlobalSettings) => {
  try {
    const picked = pick<IGlobalSettings, keyof IPersistedSettings>(settings, [
      "syncSelection",
      "filterOrderByPosition",
      "theme",
      "useCompact",
      "timeMode",
      "useInOutTimes",
    ]);
    localStorage.setItem(LS_USER_SETTINGS, JSON.stringify(picked));
  } catch (e) {
    console.warn("Failed to save settings to localStorage", e);
  }
};

export const loadRaceloggerSettings = () => {
  try {
    const serialized = localStorage.getItem(LS_RACELOGGER_SETTINGS);
    if (!serialized) {
      return undefined;
    }
    return JSON.parse(serialized);
  } catch (e) {
    console.warn("Failed to load settings from localStorage", e);
    return undefined;
  }
};
export const saveRaceloggerSettings = (settings: IRaceloggerSettings) => {
  try {
    localStorage.setItem(LS_RACELOGGER_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings to localStorage", e);
  }
};
