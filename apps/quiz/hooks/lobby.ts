import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  LobbyState,
  PlayerAction,
  LobbyEvent,
  PlayerRole,
  GameState,
} from "@/lib/types";

export const useLobby = (
  url: string
): [
  LobbyState | null,
  (type: PlayerAction, payload: any) => void,
  GameState | null,
] => {
  const ws = useRef<WebSocket | null>(null);
  const mountedRef = useRef(false);
  // TODO: Switch to more complex state management (e.g. useReducer) or other library (eg. Legend State)
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (mountedRef.current && url) {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        // toast("Connection started")
      };

      ws.current.onmessage = (event) => {
        console.log(
          "Received message from server:",
          JSON.stringify(event.data, null, 2)
        );
        const { type, payload } = JSON.parse(event.data);
        console.log("type: ", type);
        console.log("payload: ", payload);
        handleEvent(type, payload);
      };

      ws.current.onclose = (e) => {
        setLobbyState(null);
        // toast.error("Disconnected from lobby");
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

  const sendEvent = useCallback(
    (type: PlayerAction, payload: any) => {
      if (ws.current) {
        ws.current.send(JSON.stringify({ type, payload }));
      }
    },
    [ws.current]
  );

  const handleEvent = useCallback((type: LobbyEvent, payload: any) => {
    switch (type) {
      case LobbyEvent.MESSAGE:
        // toast(payload);
        break;
      case LobbyEvent.LOBBY_STATE:
        setLobbyState(payload);
        break;
      case LobbyEvent.NEW_ROUND:
        // toast(JSON.stringify(payload, null, 2));
        setGameState((prev) => {
          if (prev) {
            // toast("New round")
            return {
              ...prev,
              currentQuestion: payload.question,
              answer: null,
              currentRound: prev.currentRound + 1,
            };
          }
          return null;
        });
        break;
      case LobbyEvent.UPDATE_SCORES:
        // toast(JSON.stringify(payload, null, 2));
        setGameState((prev) => {
          if (prev) {
            return { ...prev, scores: payload.scores, answer: payload.correctAnswer};
          }
          return null;
        });
        break;
      case LobbyEvent.GAME_OVER:
        setGameState((prev) => {
          if (prev) {
            return { ...prev, status: "completed" };
          }
          return null;
        });
        break;
      case LobbyEvent.GAME_START:
        setGameState({
          status: "active",
          roundDuration: payload.roundDuration,
          totalRounds: payload.totalRounds,
          currentRound: payload.currentRound,
          currentQuestion: payload.question,
          scores: {},
          answer: null,
        });
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
        break;
    }
  }, []);

  return [lobbyState, sendEvent, gameState];
};
