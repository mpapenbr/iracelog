import { IMessage } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Session } from "autobahn";
import _ from "lodash";
import { IReplaySettings } from "../stores/ui/types";
import { MessageType } from "../stores/wamp/types";

export class ReplayDataHolder {
  private s: Session;
  private settings: IReplaySettings;
  private data: IMessage[];
  private preFetching: boolean;
  private idx: number; // current index to dispatch

  constructor(s: Session, settings: IReplaySettings) {
    this.s = s;
    this.settings = settings;
    this.data = [];
    this.idx = 0;
    this.preFetching = true;
    this.internalLoad(this.settings.minTimestamp, 20);
  }

  public loadData(startTs: number) {
    this.data = [];
    this.idx = 0;
    this.preFetching = true;
    this.internalLoad(startTs);
  }

  public async syncLoadData(startTs: number) {
    this.data = [];
    this.idx = 0;
    this.preFetching = true;
    const res = await this.s.call("racelog.archive.wamp.delta", [this.settings.eventId, startTs, 15]);
    this.processDataFromWamp(res);
    this.preFetching = false;
  }

  public next(): IMessage | undefined {
    console.log("idx:" + this.idx, "data.length:" + this.data.length);
    if (!this.preFetching && this.data.length > 0 && this.data.length - this.idx < 10) {
      console.log("request more data in advance");
      const lastTs = this.data[this.data.length - 1]["timestamp"];
      this.data.splice(0, this.idx);
      this.idx = 0;
      this.preFetching = true;
      this.internalLoad(lastTs);
    }
    return this.idx < this.data.length ? this.data[this.idx++] : undefined;
  }

  private internalLoad(startTs: number, num: number = 30) {
    console.log("requesting " + num + " entries starting at ts: " + startTs);
    this.s.call("racelog.archive.wamp.delta", [this.settings.eventId, startTs, num]).then((res: any) => {
      this.preFetching = false;
      console.log("got " + res.length + " items");
      this.processDataFromWamp(res);
    });
  }

  private processDataFromWamp(res: any) {
    let ref = res[0];
    this.data = this.data.concat(
      res.map((d: any) => {
        if (d.type === MessageType.STATE.valueOf()) {
          return { type: d.type, timestamp: d.timestamp, data: d.payload };
        }
        if (d.type === MessageType.STATE_DELTA.valueOf()) {
          const work = _.cloneDeep(ref);
          work.timestamp = d.timestamp;
          d.payload.cars.forEach((item: any[]) => {
            const row = item[0];
            const col = item[1];
            const value = item[2];
            work.payload.cars[row][col] = value;
          });
          d.payload.session.forEach((item: any[]) => {
            const col = item[0];
            const value = item[1];
            work.payload.session[col] = value;
          });

          ref = work;
          return { type: d.type, timestamp: d.timestamp, data: work.payload };
        }
      })
    );
  }
}
