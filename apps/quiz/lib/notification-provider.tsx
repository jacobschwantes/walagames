"use client";
import { createContext, useContext, useState } from "react";
type LobbyInvite = {};

type User = {
  name: string;
  image: string;
};

type Notification = {
  type: string;
  from: User;
};

interface NotificationContextType {
  notifications: Notification[];
}

const defaultContextValue: NotificationContextType = {
  notifications: [],
};
const NotificationContext =
  createContext<NotificationContextType>(defaultContextValue);

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState([]);
  return (
    <NotificationContext.Provider
      value={{
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
