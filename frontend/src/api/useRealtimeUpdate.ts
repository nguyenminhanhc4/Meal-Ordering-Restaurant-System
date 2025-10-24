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

/**
 * 🎯 Dành riêng cho xử lý realtime delete (không cần fetch lại dữ liệu)
 */
export function useRealtimeDelete<Msg>(
  topic: string,
  onDelete: (msg: Msg) => void
) {
  useEffect(() => {
    if (!topic) return;

    const client = connectWebSocket<Msg>(topic, (msg) => {
      try {
        onDelete(msg);
      } catch (err) {
        console.error("Error handling realtime delete:", err);
      }
    });

    return () => {
      client.deactivate();
    };
  }, [topic, onDelete]);
}

export function useRealtimeMessage<Msg>(
  topic: string,
  onMessage: (msg: Msg) => void
) {
  useEffect(() => {
    if (!topic) return;

    const client = connectWebSocket<Msg>(topic, onMessage);
    return () => {
      try {
        client.deactivate(); // Nếu trả Promise, không await
      } catch (e) {
        console.error("Error deactivating WebSocket:", e);
      }
    };
  }, [topic, onMessage]);
}
