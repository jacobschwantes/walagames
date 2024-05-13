"use client";

import { LobbyState, PlayerAction, PlayerRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Scoreboard } from "./scoreboard";
import {
  IconCopy,
  IconDoorExit,
  IconMedal,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconPower,
  IconSettings,
  IconStar,
  IconStarFilled,
  IconStarsFilled,
  IconTrophy,
  IconTrophyFilled,
} from "@tabler/icons-react";
import { LobbySettingsSheet } from "../lobby/settings-sheet";
import { Timer, Trophy } from "lucide-react";
import CountdownTimer from "./timer";
import { cn } from "@/lib/utils";

const colors = {
  // bg-blue-600 inner-shadow border border-blue-500/80 hover:bg-blue-500
  sky: {
    answer: "bg-sky-600 inner-shadow border border-sky-500/80 hover:bg-sky-500",
  },
  violet: {
    answer: "bg-violet-700 inner-shadow border border-violet-600/80 hover:bg-violet-600",
  },
  yellow: {
    answer: "bg-yellow-600 inner-shadow border border-yellow-500/80 hover:bg-yellow-500",
  },
  green: {
    answer: "bg-green-600 inner-shadow border border-green-500/80 hover:bg-green-500",
  },
  red: {
    answer: "bg-red-600 inner-shadow border border-red-500/80 hover:bg-red-500",
  },
  blue: {
    answer: "bg-blue-600 inner-shadow border border-blue-500/80 hover:bg-blue-500",
  },
};

const answerColors = ["blue", "violet", "yellow", "red"];

const Answer = ({
  text,
  correct,
  id,
  color = "sky",
}: {
  text: string;
  correct: boolean;
  index: number;
  id: string;
  color?: keyof typeof colors;
}) => {
  return (
    <button
      className={cn(
        "flex-1 min-h-32 flex items-center justify-center relative"
        // colors[color].answer
      )}
    >
      <div
        className={cn(
          "inset-0 absolute rounded-[var(--radius)] transition-colors duration-200",
          colors[color].answer
          // !correct && "opacity-35"
        )}
      />
      <p
        className={cn(
          "relative z-10 flex items-center text-2xl"
          // !correct && "brightness-95"
        )}
      >
        {/* {correct && <CheckIcon className="h-5 w-5" />} */}
        {text}
      </p>
    </button>
  );
};

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
  const answers = [
    {
      text: "Answer 1",
      correct: true,
      id: "1",
    },
    {
      text: "Answer 2",
      correct: false,
      id: "2",
    },
    {
      text: "Answer 3",
      correct: false,
      id: "3",
    },
    {
      text: "Answer 4",
      correct: false,
      id: "4",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-[94vh] w-full py-2 gap-2">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-1.5">
          {lobbyState.role === PlayerRole.HOST ? (
            <Button
              // size="sm"
              className="gap-1"
              variant="outline"
              onClick={() => sendEvent(PlayerAction.START_GAME, "Start Game")}
            >
              <IconPlayerPlay className="h-4 w-4 text-blue-600" /> Start
            </Button>
          //     <Button
          //   onClick={() => sendEvent(PlayerAction.CLOSE_LOBBY, "Close Lobby")}
          //   className="gap-1.5"
          //   variant="outline"
          // >
          //   <IconPower className="h-4 w-4 text-red-500" /> Shutdown
          // </Button>
          ) : (
            <Button className="gap-1.5" variant="outline">
              <IconDoorExit className="h-4 w-4 text-violet-500" /> Exit lobby
            </Button>
          )}
        </div>
        <div className="flex gap-1.5">
          <LobbySettingsSheet />

        
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col rounded-[var(--radius)] bg-[#1f242b] p-2">
        <div className="w-full justify-between flex items-start">
          <div className="flex gap-1.5">
            <CountdownTimer />
            <div className="border text-xl border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
              {/* <Iconquestion className="h-4 w-4 text-yellow-500" /> */}
              3/25
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
              <IconStarFilled className="h-4 w-4 text-blue-600" />
              1,345
            </div>
            <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
              <IconTrophyFilled className="h-4 w-4 text-yellow-500" />
              1st
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex-1 flex items-center justify-center text-5xl">
            3. What is the capital of France?
          </div>
          <ul
            // exit={{ scaleY: 0.95, opacity: 0 }}
            // initial={{ scaleY: 0.95, opacity: 0 }}
            // animate={{ scaleY: 1, opacity: 1 }}
            // transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
            // layout
            className={cn(
              " w-full gap-2 grid grid-cols-2",
              answers.length > 2 && "grid-rows-2"
            )}
          >
            {answers.map((answer, index) => (
              <Answer
                {...answer}
                index={index}
                color={(answerColors[index] as keyof typeof colors) || "sky"}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameClient;
