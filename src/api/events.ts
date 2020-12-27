import { API_BASE_URL } from "../constants";
import { IDriverMeta } from "../stores/drivers/types";
import { IRaceLogMeta } from "../stores/raceevents/types";
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
}
