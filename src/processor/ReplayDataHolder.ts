import { IManifests, IMessage } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Session } from "autobahn";
import _ from "lodash";
import { MessageType } from "../stores/types/message";
import { IReplaySettings } from "../stores/ui/types";

export class ReplayDataHolder {
  private s: Session;
  private settings: IReplaySettings;
  private data: IMessage[];
  private preFetching: boolean;
  private idx: number; // current index to dispatch
  private manifests: IManifests;
  private endOfData: boolean;

  constructor(s: Session, settings: IReplaySettings, manifests: IManifests) {
    this.s = s;
    this.settings = settings;
    this.data = [];
    this.idx = 0;
    this.preFetching = true;
    this.internalLoad(this.settings.minTimestamp, 20);
    this.manifests = manifests;
    this.endOfData = false;
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
    const res = await this.s.call("racelog.public.archive.state.delta", [
      this.settings.eventId,
      startTs,
      15,
    ]);
    this.processDataFromWamp(res);
    this.preFetching = false;
  }

  public next(): IMessage | undefined {
    console.log("replay: idx:" + this.idx, "data.length:" + this.data.length);
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

  private internalLoad(startTs: number, num = 30) {
    if (this.endOfData) {
      return;
    }
    console.log("requesting " + num + " entries starting at ts: " + startTs);
    this.s
      .call("racelog.public.archive.state.delta", [this.settings.eventId, startTs, num])
      .then((res: any) => {
        this.preFetching = false;
        this.endOfData = res.length < num;
        if (!res) {
          console.log("no data received");
          return;
        }
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
            if (work.payload.cars.length <= row) {
              work.payload.cars = [
                ...work.payload.cars,
                Array(this.manifests.car.length).fill(undefined),
              ];
            }
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
      }),
    );
  }
}
