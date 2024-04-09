"use client";
import { User } from "next-auth";
import { useState, Fragment, useEffect } from "react";
import { useLobby } from "@/hooks/lobby";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import GameClient from "../game/game-client";
import { Button } from "../ui/button";
import { createLobby, joinLobby } from "@/actions/lobby";
interface JoinLobbyControllerProps {
  user: User;
  isHost?: boolean;
}
const LobbyController = ({ user, isHost }: JoinLobbyControllerProps) => {
  const username = user.name || "";
  const [connectionStr, setConnectionStr] = useState("");
  const [lobbyState, sendEvent] = useLobby(connectionStr, username);
  const [code, setCode] = useState("");

  const handleJoinLobby = async () => {
    if (user) {
      const response = await joinLobby(code);
      if ('error' in response) {
        console.error(response.error);
        toast.error("Failed to join lobby. Please try again.");
        return;
      }
      const { server, token } = response;
      setConnectionStr(`ws://${server}/lobby/connect?token=${token}&code=${code}`);
    }
  };

  const handleCreateLobby = async () => {
    const response = await createLobby();
    if ('error' in response) {
      console.error(response.error);
      toast.error("Failed to create lobby. Please try again.");
      return;
    }

    const { server, token } = response;
    console.log("server", server);
    setConnectionStr(`ws://${server}/lobby/connect?token=${token}`);
  };

  return (
    <main className="flex flex-col items-center  h-full w-full">
      {lobbyState.isConnected ? (
        <GameClient
          sendEvent={sendEvent}
          lobbyState={lobbyState}
          username={username}
          onClose={() => console.log("game closed")}
        />
      ) : isHost ? (
        <Button onClick={handleCreateLobby}>Create a lobby</Button>
      ) : (
        <div className="gap-2 flex flex-col p-16">
          <h2 className="text-3xl">Enter a lobby code</h2>
          <LobbyCodeInput
            onComplete={handleJoinLobby}
            code={code}
            setCode={setCode}
          />
        </div>
      )}
    </main>
  );
};
export default LobbyController;

interface LobbyCodeInputProps {
  code: string;
  setCode: (code: string) => void;
  onComplete?: () => void;
}

function LobbyCodeInput({ code, setCode, onComplete }: LobbyCodeInputProps) {
  return (
    <InputOTP
      value={code}
      onChange={(value) => setCode(value.toUpperCase())}
      onComplete={onComplete}
      inputMode="text"
      autoFocus
      maxLength={4}
      render={({ slots }) => (
        <InputOTPGroup className="gap-2">
          {slots.map((slot, index) => (
            <Fragment key={index}>
              <InputOTPSlot
                className="rounded-lg border border-sky-700 bg-sky-800/10"
                {...slot}
              />
            </Fragment>
          ))}
        </InputOTPGroup>
      )}
    />
  );
}
