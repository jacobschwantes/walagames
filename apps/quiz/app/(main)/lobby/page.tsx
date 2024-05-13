"use client";
import { toast } from "sonner";
import { useLobbyContext } from "@/components/providers/lobby-provider";
import GameClient from "@/components/game/game-client";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default function Page({ searchParams }: PageProps) {
  const { sendEvent, lobbyState } = useLobbyContext();

  return (
    <main className="">
      {lobbyState ? (
        <GameClient
          sendEvent={sendEvent}
          lobbyState={lobbyState}
          username=""
          onClose={() => toast("on close called")}
        />
      ) : (
        "loading..."
      )}
    </main>
  );
}
