import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const connectWebSocket = <T,>(
  topic: string,
  onMessageReceived: (data: T) => void
) => {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    console.log("✅ Connected to WebSocket successfully!");
    client.subscribe(topic, (message) => {
      // console.log("📩 Message received from topic:", topic);
      // console.log("Message body:", message.body);
      const body: T = JSON.parse(message.body);
      onMessageReceived(body);
    });
  };

  // client.onStompError = (frame) => {
  //   console.error("❌ Broker error:", frame.headers["message"]);
  //   console.error("Additional details:", frame.body);
  // };

  client.activate();
  return client;
};
