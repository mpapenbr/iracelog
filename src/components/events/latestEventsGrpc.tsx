import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import { EventService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { Button, Descriptions, Dropdown, List } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppDispatch, useAppSelector } from "../../stores";
import { EventListData, updateEventData } from "../../stores/grpc/slices/eventDataSlice";
import { useClient } from "../../utils/useClient";
import { useDeleteEventModal } from "./deleteEvent";
import { useEditEventModal } from "./editEvent";

export const LatestEventsGrpc: React.FC = () => {
  const navigate = useNavigate();
  const cbEventClient = useClient(EventService);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  // Use the edit and delete modal hooks
  const { showEditModal, contextHolder: editContextHolder } = useEditEventModal();
  const { showDeleteModal, contextHolder: deleteContextHolder } = useDeleteEventModal();

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
    console.log("fetching events from provider");

    cbEventClient.getLatestEvents(
      {
        tenantSelector: {
          arg: { case: "externalId", value: { id: globalWamp.backendConfig.tenant.id } },
        },
      },
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log("Events fetched", res);
        dispatch(updateEventData(res));
      },
    );
  };

  const onLoadForReplayButtonClicked = (e: React.MouseEvent) => {
    const arg = (e.currentTarget as HTMLInputElement).value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg + "/classification");
  };

  const onEditEvent = (eventData: EventListData) => {
    showEditModal({
      id: eventData.event.id,
      key: eventData.event.key,
      name: eventData.event.name,
      description: eventData.event.description,
    });
  };

  const onDeleteEvent = (eventData: EventListData) => {
    showDeleteModal({
      id: eventData.event.id,
      key: eventData.event.key,
      name: eventData.event.name,
    });
  };

  const getActionsMenuItems = (eventData: EventListData) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => onEditEvent(eventData),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => {
        console.log("delete called");
        onDeleteEvent(eventData);
      },
    },
  ];

  const userMayEdit = () => {
    if (userInfo.loggedIn === false) {
      return false;
    }
    if (userInfo.info.isAdmin || userInfo.info.isEditor) {
      return true;
    }
    return false;
  };

  return (
    <>
      {editContextHolder}
      {deleteContextHolder}
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
              <Dropdown
                key={"dd-actions" + item.event.id}
                menu={{ items: getActionsMenuItems(item) }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button type="default">
                  Actions <DownOutlined />
                </Button>
              </Dropdown>,
            );
          }

          return (
            <List.Item actions={buttons}>
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
                  {timestampDate(item.event.eventTime!).toLocaleDateString(navigator.language, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          );
        }}
      />
    </>
  );
};
