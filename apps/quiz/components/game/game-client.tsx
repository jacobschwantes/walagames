"use client";

import { LobbyState, PlayerAction, PlayerRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {  useState } from "react";
import { Scoreboard } from "./scoreboard";

interface WebSocketClientProps {
  lobbyState: LobbyState;
  onClose: () => void;
  sendEvent: (type: PlayerAction, payload: any) => void;
  username: string;
}

const GameClient: React.FC<WebSocketClientProps> = ({
  lobbyState,
  sendEvent,
  onClose,
  username,
}) => {

  return (
    <div className="flex-1 flex flex-col justify-between h-full w-full gap-2 p-6 ">
      <div className="w-full">
        <h2>Lobby code: {lobbyState.code}</h2>

        {/* <div className="flex w-full justify-between">
          <h2 className="text-2xl font-medium">
            Round {lobbyState.gameState.state?.currentRound} of{" "}
            {lobbyState.gameState.settings.totalRounds}
          </h2>
          <GearIcon className="h-7 w-7 text-zinc-900" />
        </div> */}
      </div>

      <div className="flex w-full flex-1 gap-2 ">
        <div className="grid gap-2 max-w-[16rem] w-full">
          <div className="flex-1 flex flex-co border rounded-lg p-2">
            <h2 className="font-medium">Questions</h2>
          </div>
          <Scoreboard lobbyState={lobbyState} username={username}  />
        </div>
        {/* {false ? (
          <div className="flex-1 border rounded-lg flex flex-col gap-16 justify-between p-6">
            <div className="flex-1 flex flex-col  items-center gap-6">
              <div className=" flex flex-col justify-center h-16">
                <CountdownTimer
                  targetDate={lobbyState.gameState.state.deadline}
                />
              </div>
              <div className="w-full aspect-video border mx-auto flex items-center justify-center rounded-lg shadow-lg shadow-zinc-100 border-zinc-100">
                <h2 className="text-3xl font-medium">
                  {lobbyState.gameState.state?.question.question}
                </h2>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-2">
              {lobbyState.gameState.state?.question.answers.map(
                (answer, index) => (
                  <Button
                    disabled={submittedAnswer !== ""}
                    key={answer}
                    onClick={() => submitAnswer(answer.text)}
                    className={twMerge(
                      "h-16 hover:bg-black hover:text-white transition-colors duration-200",
                      answer.text === submittedAnswer
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-black"
                    )}
                  >
                    {answer.text}
                  </Button>
                )
              )}
            </div>
          </div>
        ) : ( */}
          <div className="flex-1 border rounded-lg flex flex-col gap-16 justify-between p-6">
            {lobbyState.role === PlayerRole.HOST ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => sendEvent(PlayerAction.START_GAME, "merch")}
                >
                  Start Game
                </Button>
                <Button
                  onClick={() => sendEvent(PlayerAction.CLOSE_LOBBY, "merch")}
                >
                  Close Lobby
                </Button>
                <Button
                  onClick={() => sendEvent(PlayerAction.SUBMIT_ANSWER, "merch")}
                >
                  send event
                </Button>
              </div>
            ) : (
              <h2>Waiting for the host to start the game...</h2>
            )}
          </div>

      </div>
    </div>
  );
};

export default GameClient;
