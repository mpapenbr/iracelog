import { EventService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import { Code } from "@connectrpc/connect";
import { Form, Input, Modal } from "antd";
import { useAppDispatch } from "../../stores";
import { updateEvent } from "../../stores/grpc/slices/eventDataSlice";
import { useClient } from "../../utils/useClient";

interface EditItem {
  id: number;
  key: string;
  name: string;
  description: string;
}

// Hook version using Modal.useModal
export const useEditEventModal = () => {
  const cbEventClient = useClient(EventService);
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const showEditModal = (editingItem: EditItem) => {
    let formInstance: any;

    modal.confirm({
      title: "Edit event",
      icon: null,
      content: (
        <Form
          layout="vertical"
          style={{ marginTop: 16 }}
          ref={(form) => {
            if (form) {
              formInstance = form;
              // Set initial values after form is created
              form.setFieldsValue({
                name: editingItem.name,
                description: editingItem.description,
              });
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
            initialValue={editingItem.name}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description" initialValue={editingItem.description}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      ),
      okText: "Save",
      cancelText: "Cancel",
      onOk: () => {
        if (!formInstance) {
          return Promise.reject(new Error("Form not initialized"));
        }

        return formInstance
          .validateFields()
          .then((values: any) => {
            return new Promise((resolve, reject) => {
              cbEventClient.updateEvent(
                {
                  eventSelector: { arg: { case: "id", value: editingItem.id } },
                  name: values.name,
                  description: values.description,
                },
                (err, res) => {
                  if (err !== undefined) {
                    // console.log(err);
                    if (err.code === Code.PermissionDenied) {
                      modal.error({
                        title: "Permission Denied",
                        content: "You do not have permission to edit this event.",
                      });
                    } else if (err.code === Code.NotFound) {
                      modal.error({
                        title: "Event Not Found",
                        content: "The event you are trying to edit does not exist.",
                      });
                    } else {
                      modal.error({
                        title: "Update Failed",
                        content: "Failed to update the event. Please try again.",
                      });
                    }
                    reject(err);
                    return;
                  }
                  console.log("Event updated", res);
                  dispatch(updateEvent(res.event!));
                  resolve(res);
                },
              );
            });
          })
          .catch((info: any) => {
            console.log("Validate Failed:", info);
            return Promise.reject(info);
          });
      },
    });
  };
  // Wrap contextHolder with a unique key
  const wrappedContextHolder = <div key="edit-modal-holder">{contextHolder}</div>;
  return { showEditModal, contextHolder: wrappedContextHolder };
};
