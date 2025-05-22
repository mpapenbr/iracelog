import { IGlobalSettings, IPersistedSettings } from "./grpc/slices/types";

export const loadSettings = () => {
  try {
    const serialized = localStorage.getItem("iRacelogUserSettings");
    if (!serialized) {
      return undefined;
    }
    return JSON.parse(serialized);
  } catch (e) {
    console.warn("Failed to load settings from localStorage", e);
    return undefined;
  }
};
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

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
    localStorage.setItem("iRacelogUserSettings", JSON.stringify(picked));
  } catch (e) {
    console.warn("Failed to save settings to localStorage", e);
  }
};
