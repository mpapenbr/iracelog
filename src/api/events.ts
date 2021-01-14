import { sprintf } from "sprintf-js";
import { API_BASE_URL } from "../constants";
import { IDriverMeta } from "../stores/drivers/types";
import { IEventSummary, IRaceEvent, IRaceLogMeta } from "../stores/raceevents/types";
import { ILaptimeMeta } from "../stores/types/laptimes";
import { IPitstopMeta } from "../stores/types/pitstops";
import { IStintData } from "../stores/types/stints";
import { jsonDateEnhancer } from "../utils/jsonUtils";

export interface RaceEvent {}
export default class RaceEventService {
  public static raceEventList(token: string): Promise<RaceEvent[]> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents", {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.raceEvents)) : [])
            );
        }
      });
    });
  }

  public static raceEvent(token: string, id: string): Promise<IRaceEvent> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id, {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res.json().then((j) => resolve(jsonDateEnhancer(JSON.stringify(j))));
        }
      });
    });
  }
  public static deleteEvent(token: string, id: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id, {
        method: "DELETE",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        // console.log("delete done " + res.status);
        resolve({});
      });
    });
  }

  public static eventDrivers(token: string, id: string): Promise<IDriverMeta[]> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id + "/drivers", {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.driverMetaDatas)) : [])
            );
        }
      });
    });
  }

  public static logData(token: string, id: string, sessionNum: number, sessionTime: number): Promise<IRaceLogMeta[]> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id + "/" + sessionNum + "/" + sessionTime, {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.raceLogMetaDatas)) : [])
            );
        }
      });
    });
  }

  public static eventSummary(token: string, id: string): Promise<IEventSummary> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id + "/summary", {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res.json().then((j) => resolve(j));
        }
      });
    });
  }

  public static pitStops(token: string, id: string): Promise<IPitstopMeta[]> {
    return new Promise((resolve, reject) => {
      fetch(API_BASE_URL + "/raceevents/" + id + "/pitstops", {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.pitStopMetaDatas)) : [])
            );
        }
      });
    });
  }

  public static laptimes(token: string, id: string, sessionNum: number, carIdx: number): Promise<ILaptimeMeta[]> {
    return new Promise((resolve, reject) => {
      fetch(sprintf("%s/raceevents/%s/%d/%d/laptimes", API_BASE_URL, id, sessionNum, carIdx), {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.lapDataMetaDatas)) : [])
            );
        }
      });
    });
  }
  public static stints(token: string, id: string, sessionNum: number, carIdx: number): Promise<IStintData[]> {
    return new Promise((resolve, reject) => {
      fetch(sprintf("%s/raceevents/%s/%d/%d/stints", API_BASE_URL, id, sessionNum, carIdx), {
        method: "GET",

        // headers: { Authorization: "Bearer " + token }
      }).then((res: Response) => {
        if (res.ok) {
          res
            .json()
            .then((j) =>
              resolve(j._embedded !== undefined ? jsonDateEnhancer(JSON.stringify(j._embedded.stintDatas)) : [])
            );
        }
      });
    });
  }
}
