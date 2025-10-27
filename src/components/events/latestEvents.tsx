import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Button, Descriptions, Dropdown, List, Spin } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppDispatch, useAppSelector } from "../../stores";
import { EventListData, updateEventData } from "../../stores/grpc/slices/eventDataSlice";
import { useDeleteEventModal } from "./deleteEvent";
import { useEditEventModal } from "./editEvent";

export const LatestEvents: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.userInfo);
  const events = useAppSelector((state) => state.eventData);

  // Use the edit and delete modal hooks
  const { showEditModal, contextHolder: editContextHolder } = useEditEventModal();
  const { showDeleteModal, contextHolder: deleteContextHolder } = useDeleteEventModal();

  const GET_EVENTS = gql`
    query LatestEvents($offset: Int, $limit: Int) {
      events: getEvents(offset: $offset, limit: $limit) {
        id
        key
        name
        description
        recordDate
        track {
          name
        }
      }
    }
  `;
  const { loading, data, fetchMore } = useQuery(GET_EVENTS, {
    variables: { offset: 0, limit: 10 },
  });
  // Add events to Redux store when data is received
  useEffect(() => {
    if (data?.events) {
      console.log("Adding events from GraphQL query to Redux store", data.events);
      dispatch(
        updateEventData(
          data.events.map((e: any) => ({
            id: e.id,
            key: e.key,
            name: e.name,
            description: e.description,
            eventTime: new Date(e.recordDate),
            trackName: e.track.name,
          })),
        ),
      );
    }
  }, [data, dispatch]);

  const onLoadForReplayButtonClicked = (e: React.MouseEvent) => {
    const arg = (e.currentTarget as HTMLInputElement).value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg + "/classification");
  };

  const onEditEvent = (item: any) => {
    showEditModal({
      id: item.id,
      key: item.key,
      name: item.name,
      description: item.description,
    });
  };

  const onDeleteEvent = (item: any) => {
    showDeleteModal({
      id: item.id,
      key: item.key,
      name: item.name,
    });
  };

  const getActionsMenuItems = (item: any) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => onEditEvent(item.event),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => onDeleteEvent(item.event),
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

  if (loading) return <Spin />;

  const onLoadMore = () => {
    fetchMore({ variables: { offset: data.events.length } });
  };

  const loadMore = !loading ? (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        height: 32,
        lineHeight: "32px",
      }}
    >
      <Button onClick={onLoadMore}>load more</Button>
    </div>
  ) : null;

  return (
    <>
      {editContextHolder}
      {deleteContextHolder}
      <List
        header={<h3>Latest events</h3>}
        dataSource={events}
        size="small"
        loadMore={loadMore}
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
                <Descriptions.Item span={2} label={item.event.trackName}>
                  {item.event.eventTime.toLocaleDateString(undefined, {
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
