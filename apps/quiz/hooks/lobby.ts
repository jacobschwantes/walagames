import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { LobbyState, PlayerAction, LobbyEvent, PlayerRole } from "@/lib/types";

export const useLobby = (
  url: string,
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
    if (mountedRef.current && url) {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        // sendEvent(PlayerAction.JOIN_LOBBY, { username });
      };

      ws.current.onmessage = (event) => {
        console.log("Received message", event.data);
        const { type, payload } = JSON.parse(event.data);
        handleEvent(type, payload);
      };

      ws.current.onclose = (e) => {
        setLobbyState((prevState) => ({
          ...prevState,
          isConnected: false,
          exited: true,
        }));
        lobbyState.isConnected && toast.error("Disconnected from lobby");
      };

      ws.current.onerror = () => {
        toast.error("Lobby connection failed");
      };

      return () => {
        ws.current?.close();
      };
    }

    return () => {
      mountedRef.current = true;
    };
  }, [url]);

  const sendEvent = (type: PlayerAction, payload: any) => {
    if (ws.current) {
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
      case LobbyEvent.INITIAL_STATE:
        setLobbyState((prevState) => ({
          ...prevState,
          isConnected: true,
          gameState: {
            ...prevState.gameState,
            ...payload,
          },
        }));
        toast.success("Connected to lobby");
      default:
        console.log(`Unhandled event type: ${type}`);
        break;
    }
    // Handle other event types similarly...
  };

  return [lobbyState, sendEvent];
};
