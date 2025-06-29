import { RaceloggerService } from "@buf/mpapenbr_iracelog.bufbuild_es/racelogger/v1/racelogger_service_pb";
import { Button, Form, Input, Space } from "antd";
import React from "react";
import { useAppSelector } from "../../stores";
import { useClient } from "../../utils/useLocalClient";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
export const RaceloggerRecorderInput: React.FC = () => {
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);
  const rlSettings = useAppSelector((state) => state.raceloggerSettings);
  const client = useClient(rlSettings.url, RaceloggerService);

  const [form] = Form.useForm();
  if (rlStatus.raceloggerServerAvailable !== true) {
    return (
      <div>
        <h4>Racelogger server is not available</h4>
        <p>Please check your Racelogger settings and ensure the server is running.</p>
      </div>
    );
  }
  if (rlStatus.raceSessions.length === 0) {
    return (
      <div>
        <h4>No race sessions available</h4>
        <p>Please start a race session before recording.</p>
      </div>
    );
  }

  const onFinish = (values: any) => {
    console.log(values);
    if (rlStatus.raceSessions.length === 0) {
      return;
    }
    if (rlStatus.raceSessions.length === 1) {
      client.startRecording(
        {
          name: values.eventName ?? "",
          descriptions: [values.eventDescription ?? ""],
        },
        (err, res) => {
          if (err) {
            console.error("Error starting recording:", err);
            return;
          }
          console.log("Recording started:", res);
        },
      );
    }
  };
  const onStopRecording = (values: any) => {
    client.stopRecording({}, (err, res) => {
      if (err) {
        console.error("Error stopping recording:", err);
        return;
      }
      console.log("Recording stopped:", res);
    });
  };

  const onReset = () => {
    form.resetFields();
  };

  const eventDescriptions = () => {
    if (rlStatus.raceSessions.length === 0) {
      return <></>;
    }
    if (rlStatus.raceSessions.length === 1) {
      return (
        <Form.Item name="eventDescription" label="Description">
          <Input />
        </Form.Item>
      );
    }
    const inner = rlStatus.raceSessions.map((race) => {
      return (
        <Form.Item name={`eventDescription_${race.num}`} label={race.name}>
          <Input />
        </Form.Item>
      );
    });

    return <>{inner}</>;
  };
  const eventDescriptionsTry = () => {
    const myRaces = [
      { num: 2, name: "HEAT" },
      { num: 3, name: "FEATURE" },
    ];

    const inner = myRaces.map((race) => {
      return (
        <Form.Item name={`eventDescription_${race.num}`} label={race.name}>
          <Input />
        </Form.Item>
      );
    });

    return <>{inner}</>;
  };
  return (
    <>
      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        disabled={rlStatus.recording}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="eventName" label="Event name">
          <Input />
        </Form.Item>
        {eventDescriptions()}
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              Record
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
      {rlStatus.recording ? (
        <div>
          <Button type="primary" onClick={onStopRecording} htmlType="submit">
            Stop recoding
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
