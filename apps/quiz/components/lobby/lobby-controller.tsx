"use client";
import { useLobby } from "@/hooks/lobby";

import GameClient from "../game/game-client";
import { redirect, useRouter } from "next/navigation";
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
  return (
    <main className="flex flex-col items-center h-full w-full">
      {lobbyState.isConnected ? (
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
