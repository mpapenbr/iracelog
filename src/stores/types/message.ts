// Note: Keep this in sync with iracelog_service_manager/model/message.py and racelogger/model/messages.py
export enum MessageType {
  EMPTY = 0,
  STATE = 1,
  STATE_DELTA = 2,
  SPEEDMAP = 3,
  CAR = 4,
}

export interface IMessage {
  msgType: number;
  timestamp: number;
  data: any;
}
