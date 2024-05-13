"use client";
import { useEvents } from "@/hooks/events";
import { createContext, useContext, useEffect, useState } from "react";

type LobbyInvite = {};

type User = {
  name: string;
  image: string;
};

type Event = {
  type: string;
  from: User;
};

interface EventContextType {
  events: Event[];
}

const defaultContextValue: EventContextType = {
  events: [],
};
const EventContext = createContext<EventContextType>(defaultContextValue);

export const useEventContext = () => useContext(EventContext);

export const EventProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [events] = useEvents("/api/events");


  return (
    <EventContext.Provider
      value={{
        events,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
