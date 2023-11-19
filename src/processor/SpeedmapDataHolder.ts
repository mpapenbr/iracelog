import { IMessage } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Session } from "autobahn";
import { IReplaySettings } from "../stores/ui/types";

export class SpeedmapDataHolder {
  private s: Session;
  private settings: IReplaySettings;
  private data: IMessage[];
  private preFetching: boolean;
  private idx: number; // current index to dispatch
  private endOfData: boolean;

  constructor(s: Session, settings: IReplaySettings) {
    this.s = s;
    this.settings = settings;
    this.data = [];
    this.idx = 0;
    this.preFetching = true;
    this.endOfData = false;
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
    const res = await this.s.call("racelog.public.archive.speedmap", [
      this.settings.eventId,
      startTs,
      15,
    ]);
    this.processDataFromWamp(res);
    this.preFetching = false;
  }

  public next(currentTs: number): IMessage | undefined {
    console.log("speedmap: idx:" + this.idx, "data.length:" + this.data.length);
    if (!this.preFetching && this.data.length > 0 && this.data.length - this.idx < 10) {
      console.log("request more speedmap data in advance");
      const lastTs = this.data[this.data.length - 1].timestamp;
      this.data.splice(0, this.idx);
      this.idx = 0;
      this.preFetching = true;
      this.internalLoad(lastTs);
    }
    if (this.idx < this.data.length) {
      if (this.data[this.idx].timestamp < currentTs) {
        return this.data[this.idx++];
      }
    }
    return undefined;
    // return this.idx < this.data.length ? this.data[this.idx++] : undefined;
  }

  private internalLoad(startTs: number, num = 30) {
    if (this.endOfData) {
      return;
    }
    console.log("requesting " + num + " speedmap entries starting at ts: " + startTs);
    this.s
      .call("racelog.public.archive.speedmap", [this.settings.eventId, startTs, num])
      .then((res: any) => {
        this.preFetching = false;
        this.endOfData = res.length < num;
        console.log("got " + res.length + " speedmap items");

        this.processDataFromWamp(res);
      });
  }

  private processDataFromWamp(res: any) {
    this.data = this.data.concat(
      res.map((d: any) => ({ type: d.type, data: d.payload, timestamp: d.timestamp })),
    );
  }
}
