import { LoginOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { ProviderService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/provider/v1/provider_service_pb";
import { UserService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/user/v1/user_service_pb";
import { Button, Dropdown, Space, Typography } from "antd";
import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../stores";
import { useClient } from "../../utils/useClient";

const { Text } = Typography;

interface UserAuthComponentProps {
  onLogin: () => void;
  onLogout: () => void;
  pingIntervalMs?: number; // Optional ping interval, defaults to 30 seconds
}

export const UserAuthComponentMainMenu: React.FC<UserAuthComponentProps> = ({
  onLogin,
  onLogout,
  pingIntervalMs = 30000,
}) => {
  const userInfo = useAppSelector((state) => state.userInfo);
  const serverSettings = useAppSelector((state) => state.serverSettings);
  const dispatch = useAppDispatch();
  const cbUserClient = useClient(UserService);
  const cbProviderClient = useClient(ProviderService);
  const pingIntervalRef = useRef<number | null>(null);

  // Ping function
  const sendPing = () => {
    if (!userInfo.loggedIn) {
      return;
    }

    cbProviderClient.ping({}, (err, res) => {
      if (err !== undefined) {
        console.log("Ping failed:", err);
        return;
      }
      console.log("Ping successful:", res);
    });
  };

  // Start ping interval when user logs in
  useEffect(() => {
    if (userInfo.loggedIn && userInfo.info) {
      console.log("Starting ping interval");
      pingIntervalRef.current = setInterval(sendPing, pingIntervalMs);

      // Send initial ping
      sendPing();
    } else {
      // Stop ping interval when user logs out
      if (pingIntervalRef.current) {
        console.log("Stopping ping interval");
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [userInfo.loggedIn, userInfo.info, pingIntervalMs, cbUserClient, dispatch, onLogout]);

  // Don't render if server doesn't support logins
  if (!serverSettings.supportsLogins) {
    return null;
  }

  const handleLogout = () => {
    // Clear ping interval before logout
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    onLogout();
  };

  const frontColor = "rgba(255, 255, 255, 0.65)"; // has to match color in AppMenu in App.tsx
  if (userInfo.loggedIn && userInfo.info) {
    // User is logged in - show user menu
    const userMenuItems = [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        disabled: true, // For now, just show the name
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
      },
    ];

    return (
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
        <Button
          type="text"
          style={{
            color: frontColor,
            height: "auto",
          }}
        >
          <Space>
            <UserOutlined style={{ color: frontColor }} />
            <Text style={{ color: frontColor }}>
              {userInfo.info.username || userInfo.info.email || "User"}
            </Text>
          </Space>
        </Button>
      </Dropdown>
    );
  }

  // User is not logged in - show login button
  return (
    <Button
      icon={<LoginOutlined />}
      onClick={onLogin}
      size="small"
      style={{
        color: frontColor,
        height: "auto",
        background: "transparent",
        border: "none",
      }}
    >
      Login
    </Button>
  );
};
