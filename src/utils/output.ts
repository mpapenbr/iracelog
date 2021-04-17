import { sprintf } from "sprintf-js";

/**
 * converts sec value in human readable string presentation MM:SS
 * @param t value in sec
 */
export const secAsString = (t: number): string => {
  return t > 3600 ? secAsHHMMSS(t) : secAsMMSS(t);
};
export const lapTimeString = (t: number): string => {
  let work = t;
  const minutes = Math.floor(t / 60);
  work -= minutes * 60;
  const seconds = Math.trunc(work);
  work -= seconds;
  const hundrets = Math.trunc(work * 100);
  return minutes > 0 ? sprintf("%d:%02d.%02d", minutes, seconds, hundrets) : sprintf("%02d.%02d", seconds, hundrets);
};

export const lapTimeStringTenths = (t: number): string => {
  let work = t;
  const minutes = Math.floor(t / 60);
  work -= minutes * 60;
  const seconds = Math.trunc(work);
  work -= seconds;
  const tenths = Math.trunc(work * 10);
  return sprintf("%d:%02d.%1d", minutes, seconds, tenths);
};
/**
 * converts sec value in human readable string presentation MM:SS
 * @param t value in sec
 */
export const secAsMMSS = (t: number): string => {
  const minutes = Math.floor(t / 60);
  const seconds = Math.trunc(t - minutes * 60);
  return sprintf("%d:%02d", minutes, seconds);
};

/**
 * converts sec value in human readable string presentation in HH:MM:SS
 * @param t value in sec
 */
export const secAsHHMMSS = (t: number): string => {
  let work = t;
  const hours = Math.floor(work / 3600);
  work -= hours * 3600;
  const minutes = Math.floor(work / 60);
  work -= minutes * 60;
  const seconds = Math.trunc(work);
  return sprintf("%d:%02d:%02d", hours, minutes, seconds);
};

/**
 * zero-leading numbers are coded this way:
 * 3007 -> 007
 * 2001 -> 01
 * @param raw
 */
export const adjustRawNumber = (raw: string): string => {
  return raw.length === 4 ? raw.slice(raw.length - parseInt(raw[0])) : raw;
};

/**
 * used for sorting car numbers as string. car number with leading 0 will be sorted after the raw value, sorted by number of leading 0
 * @param a
 * @param b
 * @returns
 */
export const sortCarNumberStr = (a: string, b: string) => {
  const cmp = parseInt(a) - parseInt(b);
  if (cmp === 0) {
    return a.length - b.length;
  } else return cmp;
};
