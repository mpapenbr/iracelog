import { gql, useQuery } from "@apollo/client";
import { Button, Descriptions, List, Spin } from "antd";
import React from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";

export const LatestEvents: React.FC = () => {
  const navigate = useNavigate();
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
  const { loading, data, fetchMore } = useQuery(GET_EVENTS, { variables: { offset: 0, limit: 5 } });
  const onLoadForReplayButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const arg = e.currentTarget.value;
    globalWamp.currentLiveId = undefined;
    navigate("/analysis/" + arg);
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
    <List
      header={<h3>Latest events</h3>}
      dataSource={data.events}
      size="small"
      loadMore={loadMore}
      renderItem={(item: any) => (
        <List.Item
          actions={[
            // <Button value={item.key} type="default" onClick={onLoadButtonClicked_OoO}>
            //   Load
            // </Button>,
            <Button
              key={"bt-replay" + item.eventId}
              value={item.key}
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
      )}
    />
  );
};
