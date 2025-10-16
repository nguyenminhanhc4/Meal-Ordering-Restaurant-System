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
    client.subscribe(topic, (message) => {
      const body: T = JSON.parse(message.body);
      onMessageReceived(body);
    });
  };

  client.activate();
  return client;
};
