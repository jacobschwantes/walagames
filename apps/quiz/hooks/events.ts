import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export const useEvents = (url) => {
  const eventSource = useRef<EventSource | null>(null);
  const mountedRef = useRef(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!mountedRef.current && url) {
      eventSource.current = new EventSource(url);

      eventSource.current.onmessage = (event) => {
        console.log("Received event:", event.data);
        const newEvent = JSON.parse(event.data);
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      };

      eventSource.current.onerror = (error) => {
        console.error("EventSource failed:", error);
        toast.error("Failed to connect to events stream");
        eventSource.current?.close();
      };

      return () => {
        eventSource.current?.close();
      };
    }

    return () => {
      mountedRef.current = true;
    };
  }, [url]); // Only re-run the effect if the URL changes

  return [events];
};
