import { EventService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/event/v1/event_service_connect";
import { Button, Descriptions, List } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppDispatch, useAppSelector } from "../../stores";
import { updateEventData } from "../../stores/grpc/slices/eventDataSlice";
import { useClient } from "../../utils/useClient";

export const LatestEventsGrpc: React.FC = () => {
  const navigate = useNavigate();

  const cbEventClient = useClient(EventService);

  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const events = useAppSelector((state) => state.eventData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    onReloadRequested();
    setLoading(false);
  }, [loadTrigger]);

  const onReloadRequested = async () => {
    if (loading) {
      console.log("already loading");
      return;
    }
    setLoading(true);
    console.log("fetching events from  provider");

    cbEventClient.getLatestEvents({}, (err, res) => {
      if (err != undefined) {
        console.log(err);
        return;
      }
      console.log("Events fetched", res);

      dispatch(updateEventData(res));
      // setData({ events: res.getEventsList() });
    });
  };
  const onLoadForReplayButtonClicked = (e: React.MouseEvent) => {
    const arg = (e.currentTarget as HTMLInputElement).value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg);
  };
  return (
    <List
      header={<h3>Latest events</h3>}
      dataSource={events}
      size="small"
      renderItem={(item: any) => (
        <List.Item
          actions={[
            // <Button value={item.key} type="default" onClick={onLoadButtonClicked_OoO}>
            //   Load
            // </Button>,
            <Button
              key={"bt-replay" + item.event.Id}
              value={item.event.key}
              type="default"
              onClick={onLoadForReplayButtonClicked}
            >
              Load
            </Button>,
          ]}
        >
          {/* <List.Item.Meta title={item.name} description={item.recordDate} /> */}
          {/* <Card title={item.name} size="small" bordered={false} style={{ width: "100%" }}>
                {item.description ? <p>{item.description}</p> : <></>}
                <p>
                  {item.track.name},{" "}
                  {new Date(item.recordDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </Card> */}
          <Descriptions size="small" column={2} colon={false}>
            <Descriptions.Item span={item.event.description ? 1 : 2}>
              <b>{item.event.name}</b>
            </Descriptions.Item>
            {item.event.description ? (
              <Descriptions.Item>
                <div className="iracelog-event-description">{item.event.description}</div>
              </Descriptions.Item>
            ) : (
              <></>
            )}
            <Descriptions.Item span={2} label={"ID: " + item.event.id}>
              {item.event.eventTime?.toDate().toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Descriptions.Item>
          </Descriptions>
        </List.Item>
      )}
    />
  );
};
