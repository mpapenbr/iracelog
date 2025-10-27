import { ExclamationCircleOutlined } from "@ant-design/icons";
import { EventService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import { Code } from "@connectrpc/connect";
import { Modal } from "antd";
import { useAppDispatch } from "../../stores";
import { removeEvent } from "../../stores/grpc/slices/eventDataSlice";
import { useClient } from "../../utils/useClient";

interface DeleteItem {
  id: number;
  key: string;
  name: string;
}

export const useDeleteEventModal = () => {
  const cbEventClient = useClient(EventService);
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const showDeleteModal = (deleteItem: DeleteItem) => {
    console.log("showDeleteModal called with:", deleteItem);

    modal.confirm({
      title: "Delete Event",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        console.log("Delete confirmed for:", deleteItem.id);

        return new Promise((resolve, reject) => {
          cbEventClient.deleteEvent(
            {
              eventSelector: { arg: { case: "id", value: deleteItem.id } },
            },
            (err, res) => {
              if (err != undefined) {
                // console.log("Delete error:", err);
                if (err.code === Code.PermissionDenied) {
                  modal.error({
                    title: "Permission Denied",
                    content: "You do not have permission to delete this event.",
                  });
                } else if (err.code === Code.NotFound) {
                  modal.error({
                    title: "Event Not Found",
                    content: "The event you are trying to delete does not exist.",
                  });
                } else {
                  modal.error({
                    title: "Delete Failed",
                    content: "Failed to delete the event. Please try again.",
                  });
                }
                reject(err);
                return;
              }
              console.log("Event deleted", res);
              dispatch(removeEvent(deleteItem.id));
              resolve(res);
            },
          );
        });
      },
      onCancel() {
        console.log("Delete cancelled");
      },
    });
  };
  // Wrap contextHolder with a unique key
  const wrappedContextHolder = <div key="delete-modal-holder">{contextHolder}</div>;
  return { showDeleteModal, contextHolder: wrappedContextHolder };
};
