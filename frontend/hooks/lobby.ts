import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { LobbyState, PlayerAction, LobbyEvent, PlayerRole } from "@/lib/types";
import { set } from "react-hook-form";

export const useLobby = (
  url: string
): [LobbyState, (type: PlayerAction, payload: any) => void] => {
  const ws = useRef<WebSocket | null>(null);
  const mountedRef = useRef(false);
  // TODO: Switch to more complex state management (e.g. useReducer) or other library (eg. Legend State)
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    isConnected: false,
    exited: false,
    players: [],
    messages: [],
    gameState: {},
  });

  useEffect(() => {
    if (mountedRef.current) {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setLobbyState((prevState) => ({ ...prevState, isConnected: true }));
        toast.success("Connected to lobby");
      };

      ws.current.onmessage = (event) => {
        console.log("Received message", event.data);
        const { type, payload } = JSON.parse(event.data);
        handleEvent(type, payload);
      };

      ws.current.onclose = () => {
        setLobbyState((prevState) => ({
          ...prevState,
          isConnected: false,
          exited: true,
        }));
        toast.error("Disconnected from lobby");
      };

      ws.current.onerror = () => {
        toast.error("Failed to connect to lobby");
      };

      return () => {
        ws.current?.close();
      };
    }

    return () => {
      mountedRef.current = true;
    };
  }, []);

  const sendEvent = (type: PlayerAction, payload: any) => {
    if (ws.current && lobbyState.isConnected) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  };

  // TODO: make a more complex type for the event payload instead of `any`
  const handleEvent = (type: LobbyEvent, payload: any) => {
    // Update state based on the event type and payload
    // For example, handling a new chat message event:
    switch (type) {
      case LobbyEvent.NEW_MESSAGE:
        setLobbyState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, payload],
        }));
        break;
      case LobbyEvent.PLAYER_JOIN:
        setLobbyState((prevState) => ({
          ...prevState,
          players: [...prevState.players, payload],
        }));
        break;
      case LobbyEvent.PLAYER_LEAVE:
        setLobbyState((prevState) => ({
          ...prevState,
          players: prevState.players.filter((player) => player.id !== payload),
        }));
        break;
      case LobbyEvent.GAME_STATE:
        setLobbyState((prevState) => ({
          ...prevState,
          gameState: {
            ...prevState.gameState,
            ...payload,
          },
        }));
        break;
      case LobbyEvent.PLAYER_LIST:
        setLobbyState((prevState) => ({
          ...prevState,
          gameState: {
            ...prevState.gameState,
            players: payload,
          },
        }));
        break;
      case LobbyEvent.SERVER_MESSAGE:
        setLobbyState((prevState) => ({
          ...prevState,
          messages: [
            ...prevState.messages,
            { username: "Server", message: payload, timestamp: Date.now() },
          ],
        }));
        break;
      case LobbyEvent.LOBBY_STATE:
        setLobbyState((prevState) => ({
          ...prevState,
          gameState: {
            ...prevState.gameState,
            ...payload,
          },
        }));
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
        break;
    }
    // Handle other event types similarly...
  };

  return [lobbyState, sendEvent];
};
