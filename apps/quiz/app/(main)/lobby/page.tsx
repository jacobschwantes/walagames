"use client";
import { toast } from "sonner";
import { useLobbyContext } from "@/lib/lobby-provider";
import GameClient from "@/components/game/game-client";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default function Page({ searchParams }: PageProps) {
  const { sendEvent, lobbyState } = useLobbyContext();

  return (
    <main className="flex  flex-col items-center w-full">
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
