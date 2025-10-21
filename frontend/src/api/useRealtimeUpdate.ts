import { useEffect } from "react";
import { connectWebSocket } from "./websocketClient";

export function useRealtimeUpdate<T, ID = unknown, Msg = unknown>(
  topic: string,
  fetchFn: (id: ID) => Promise<T>,
  onUpdate: (data: T) => void,
  getIdFromMsg: (msg: Msg) => ID
) {
  useEffect(() => {
    if (!topic) return;

    const client = connectWebSocket<Msg>(topic, (msg) => {
      const handleMessage = async () => {
        try {
          const id = getIdFromMsg(msg);
          const updated = await fetchFn(id);
          onUpdate(updated);
        } catch (err) {
          console.error("Error fetching realtime data:", err);
        }
      };
      handleMessage();
    });

    return () => {
    client.deactivate(); 
  };
  }, [topic, fetchFn, onUpdate, getIdFromMsg]);
}

