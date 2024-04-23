"use client";
import { useLobby } from "@/hooks/lobby";

import GameClient from "../game/game-client";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
interface JoinLobbyControllerProps {
  username: string;
  connectionStr: string;
}
const LobbyController = ({
  username,
  connectionStr,
}: JoinLobbyControllerProps) => {
  const [lobbyState, sendEvent] = useLobby(connectionStr);
  const router = useRouter();

  useEffect(() => {
    console.log(lobbyState)
  }, [lobbyState])

  return (
    <main className="flex flex-col items-center h-full w-full">
      {lobbyState && lobbyState.code ? (
        <GameClient
          sendEvent={sendEvent}
          lobbyState={lobbyState}
          username={username}
          onClose={() => router.push("/")}
        />
      ) : (
        <div>Loading</div>
      )}
    </main>
  );
};
export default LobbyController;
