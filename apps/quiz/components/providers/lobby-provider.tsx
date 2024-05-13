"use client";
import { createLobby, joinLobby } from "@/actions/lobby";
import { useLobby } from "@/hooks/lobby";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { GameState, LobbyState, PlayerAction } from "../../lib/types";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
interface LobbyContextType {
  lobbyState: LobbyState | null; // Assuming LobbyState is already defined in your types
  gameState: GameState | null;
  sendEvent: (type: PlayerAction, payload: any) => void; // Customize based on actual usage
  createLobby: (quizID: string) => Promise<void | Error>;
  joinLobby: (lobbyCode: string) => Promise<void | Error>;
}

const defaultContextValue: LobbyContextType = {
  lobbyState: null,
  gameState: null,
  sendEvent: () => {}, // Provide no-op defaults for initialization
  createLobby: async () => {},
  joinLobby: async () => {},
};
const LobbyContext = createContext<LobbyContextType>(defaultContextValue);

export const useLobbyContext = () => useContext(LobbyContext);

export const LobbyProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [headerEnabled, setHeaderEnabled] = useState(false);
  const [lobbyState, sendEvent, gameState] = useLobby(url);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const storageItem = localStorage.getItem("lobby");
        if (!storageItem) return;

        const lobby = JSON.parse(storageItem);
        if (lobby && new Date().getTime() < lobby.expiration) {
          const response = await joinLobby(lobby.code);
          if ("error" in response) {
            localStorage.removeItem("lobby");
            throw new Error(response.error);
          }

          const { token, endpoint, code } = response;

          localStorage.setItem(
            "lobby",
            JSON.stringify({
              code,
              endpoint,
              expiration: new Date().getTime() + 3600000, // Expires in 1 hour // TODO: change this to shorter time
            })
          );

          setUrl(`ws://${endpoint}/connect?token=${token}`);
          setHeaderEnabled(true)
        }
      } catch (e) {
        console.log(e);
        return;
      }
    });

    return () => clearTimeout(timeout);
  }, []);

  const handleCreateLobby = async (quizID: string) => {
    const response = await createLobby(quizID);
    if ("error" in response) {
      throw new Error(response.error);
    }

    const { endpoint, token, code } = response;

    localStorage.setItem(
      "lobby",
      JSON.stringify({
        code,
        endpoint,
        expiration: new Date().getTime() + 3600000, // Expires in 1 hour // TODO: change this to shorter time
      })
    );

    setUrl(`ws://${endpoint}/connect?token=${token}`);

    setTimeout(() => {
      setHeaderEnabled(true);
    }, 500);
  };

  const handleJoinLobby = async (lobbyCode: string): Promise<void | Error> => {
    console.log("join lobby called")
    const response = await joinLobby(lobbyCode);
    if ("error" in response) {
      throw new Error(response.error);
    }

    const { endpoint, token, code } = response;

    localStorage.setItem(
      "lobby",
      JSON.stringify({
        code,
        endpoint,
        expiration: new Date().getTime() + 3600000, // Expires in 1 hour // TODO: change this to shorter time
      })
    );

    setUrl(`ws://${endpoint}/connect?token=${token}`);
  };

  return (
    <LobbyContext.Provider
      value={{
        lobbyState,
        sendEvent,
        gameState,
        createLobby: handleCreateLobby,
        joinLobby: handleJoinLobby,
      }}
    >
      {/* {!pathname.includes("lobby") && lobbyState && headerEnabled && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="w-full flex"
        >
          Active Lobby: {lobbyState.code}
          <Link href="/lobby">
            <Button>Return</Button>
          </Link>
        </motion.div>
      )} */}
      {children}
    </LobbyContext.Provider>
  );
};
