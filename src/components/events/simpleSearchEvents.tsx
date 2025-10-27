import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { Button, Descriptions, Dropdown, Input, List, Space, Spin } from "antd";
import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { useDeleteEventModal } from "./deleteEvent";
import { useEditEventModal } from "./editEvent";

const { Search } = Input;

export const SimpleSearchEvents: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useAppSelector((state) => state.userInfo);

  // Use the edit and delete modal hooks
  const { showEditModal, contextHolder: editContextHolder } = useEditEventModal();
  const { showDeleteModal, contextHolder: deleteContextHolder } = useDeleteEventModal();

  const GET_EVENTS = gql`
    query SimpleSearchEvents($arg: String!, $offset: Int, $limit: Int) {
      events: advancedSearchEvent(arg: $arg, offset: $offset, limit: $limit) {
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
  const [doSearch, { loading, data, fetchMore }] = useLazyQuery(GET_EVENTS, {
    variables: { offset: 0, limit: 5, arg: "" },
  });
  const [searchArg, setSearchArg] = useState("");

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
      onClick: () => onEditEvent(item),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => onDeleteEvent(item),
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
    fetchMore({
      variables: { offset: data.events.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.events) {
          return prev;
        }
        const ret = { events: [...data.events, ...fetchMoreResult.events] };
        return ret;
      },
    });
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

  const onSearch = (val: string) => {
    doSearch({ variables: { arg: val, offset: 0, limit: 10 } });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchArg(e.target.value);
  };

  const SearchHeader = (
    <>
      <Space direction="horizontal">
        <h3>Quick search</h3>
        <Search
          placeholder="search for event, track, team, driver"
          value={searchArg}
          onSearch={onSearch}
          onChange={onChange}
          style={{ width: 300 }}
        />
      </Space>
    </>
  );

  return (
    <>
      {editContextHolder}
      {deleteContextHolder}
      <List
        header={SearchHeader}
        dataSource={data?.events ?? []}
        size="small"
        loadMore={loadMore}
        renderItem={(item: any) => {
          let buttons = [
            <Button
              key={"bt-replay" + item.id}
              value={item.key}
              type="default"
              onClick={onLoadForReplayButtonClicked}
            >
              Load
            </Button>,
          ];

          if (userMayEdit()) {
            buttons.push(
              <Dropdown
                key={"dd-actions" + item.id}
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
                <Descriptions.Item span={item.description ? 1 : 2}>
                  <b>{item.name}</b>
                </Descriptions.Item>
                {item.description ? (
                  <Descriptions.Item>
                    <div className="iracelog-event-description">{item.description}</div>
                  </Descriptions.Item>
                ) : (
                  <></>
                )}
                <Descriptions.Item span={2} label={item.track.name}>
                  {new Date(item.recordDate).toLocaleDateString(undefined, {
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
