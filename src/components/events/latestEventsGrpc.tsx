import { EventService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { Button, Descriptions, Form, Input, List, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppDispatch, useAppSelector } from "../../stores";
import {
  EventListData,
  updateEvent,
  updateEventData,
} from "../../stores/grpc/slices/eventDataSlice";
import { useClient } from "../../utils/useClient";

export const LatestEventsGrpc: React.FC = () => {
  const navigate = useNavigate();

  const cbEventClient = useClient(EventService);

  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  const events = useAppSelector((state) => state.eventData);
  const userInfo = useAppSelector((state) => state.userInfo);

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

    cbEventClient.getLatestEvents(
      {
        tenantSelector: {
          arg: { case: "externalId", value: { id: globalWamp.backendConfig.tenant.id } },
        },

        // { externalId: globalWamp.backendConfig.tenant.id },
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("Events fetched", res);

        dispatch(updateEventData(res));
        // setData({ events: res.getEventsList() });
      },
    );
  };
  const onLoadForReplayButtonClicked = (e: React.MouseEvent) => {
    const arg = (e.currentTarget as HTMLInputElement).value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg + "/classification");
  };

  const onEditButtonClicked = (e: React.MouseEvent) => {
    const arg = (e.currentTarget as HTMLInputElement).value;
    console.log("Edit event clicked for event key " + arg);

    setEditEvent(true);
    form.setFieldsValue({ name: "", description: "" });
    const ev = events.find((e) => e.event.key === arg);
    if (ev) {
      setEditingItem({
        id: ev.event.id,
        key: ev.event.key,
        name: ev.event.name,
        description: ev.event.description,
      });
      form.setFieldsValue({ name: ev.event.name, description: ev.event.description });
    }
  };

  const userMayEdit = () => {
    if (userInfo.loggedIn === false) {
      return false;
    }
    if (userInfo.info.isAdmin || userInfo.info.isEditor) {
      return true;
    }
    return false;
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Edit event dialog OK clicked", values, " on item", editingItem?.key);
        cbEventClient.updateEvent(
          {
            // eventSelector: { arg: { case: "key", value: editingItem?.key! } },
            eventSelector: { arg: { case: "id", value: editingItem?.id! } },
            name: values.name,
            description: values.description,
          },
          (err, res) => {
            if (err != undefined) {
              console.log(err);
              return;
            }
            console.log("Event updated", res);
            dispatch(updateEvent(res.event!));
          },
        );
        setEditingItem(null);
        setEditEvent(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  const handleCancel = () => {
    setEditEvent(false);
  };
  interface EditItem {
    id: number;
    key: string;
    name: string;
    description: string;
  }
  const [editingItem, setEditingItem] = useState<EditItem | null>(null);
  const [form] = Form.useForm();
  const EditEventDialog: React.FC = () => {
    return (
      <>
        <Modal
          title="Edit event"
          closable={{ "aria-label": "Custom Close Button" }}
          open={editEvent}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form form={form}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter a name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };
  return (
    <>
      <EditEventDialog />
      <List
        header={<h3>Latest events</h3>}
        dataSource={events}
        size="small"
        renderItem={(item: EventListData) => {
          let buttons = [
            <Button
              key={"bt-replay" + item.event.id}
              value={item.event.key}
              type="default"
              onClick={onLoadForReplayButtonClicked}
            >
              Load
            </Button>,
          ];
          if (userMayEdit()) {
            buttons.push(
              <Button
                key={"bt-edit" + item.event.id}
                value={item.event.key}
                type="default"
                onClick={onEditButtonClicked}
              >
                Edit
              </Button>,
            );
          }

          const ret = (
            <List.Item actions={buttons}>
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
                  {/* {item.event.eventTime?.toDate().toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })} */}
                  {timestampDate(item.event.eventTime!).toLocaleDateString(navigator.language, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          );
          return ret;
        }}
      />
    </>
  );
};
