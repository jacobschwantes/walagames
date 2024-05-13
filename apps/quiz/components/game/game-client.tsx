"use client";

import { LobbyState, PlayerAction, PlayerRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Scoreboard } from "./scoreboard";
import {
  IconCheck,
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
  IconX,
} from "@tabler/icons-react";
import { LobbySettingsSheet } from "../lobby/settings-sheet";
import { Timer, Trophy, XIcon } from "lucide-react";
import CountdownTimer from "./timer";
import { cn } from "@/lib/utils";
import { useLobbyContext } from "../providers/lobby-provider";
import { send } from "process";
import Podium from "./podium";
import { AnimatePresence, motion } from "framer-motion";

const colors = {
  // bg-blue-600 inner-shadow border border-blue-500/80 hover:bg-blue-500
  sky: {
    answer: "bg-sky-600 inner-shadow border border-sky-500/80 hover:bg-sky-500",
  },
  violet: {
    answer:
      "bg-violet-700 inner-shadow border border-violet-600/80 hover:bg-violet-600",
  },
  yellow: {
    answer:
      "bg-yellow-600 inner-shadow border border-yellow-500/80 hover:bg-yellow-500",
  },
  green: {
    answer:
      "bg-green-600 inner-shadow border border-green-500/80 hover:bg-green-500",
  },
  red: {
    answer: "bg-red-600 inner-shadow border border-red-500/80 hover:bg-red-500",
  },
  blue: {
    answer:
      "bg-blue-600 inner-shadow border border-blue-500/80 hover:bg-blue-500",
  },
};

const answerColors = ["blue", "violet", "yellow", "red"];

const Answer = ({
  text,
  correct,
  id,
  color = "sky",
  selected,
  answerRevealed,
  handleClick,
}: {
  text: string;
  index: number;
  correct: boolean;
  id: string;
  color?: keyof typeof colors;
  selected: string;
  answerRevealed: boolean;
  handleClick: (id: string) => void;
}) => {
  return (
    <button
      onClick={() => handleClick(id)}
      className={cn(
        "flex-1 min-h-32 flex items-center justify-center relative"
        // colors[color].answer
      )}
    >
      <div
        className={cn(
          "inset-0 absolute rounded-[var(--radius)] transition-colors duration-200",
          colors[color].answer,
          answerRevealed
            ? !correct && "opacity-35"
            : selected && selected != id && "opacity-35"
        )}
      />
      <p
        className={cn(
          "relative z-10 flex items-center text-2xl"
          // !correct && "brightness-95"
        )}
      >
        {selected === id &&
          (!correct && answerRevealed ? (
            <IconX
              className={cn(
                "h-7 w-7 ",
                color === "red" ? "text-white" : "text-red-500"
              )}
            />
          ) : (
            <IconCheck
              className={cn(
                "h-7 w-7",
                correct ? "text-green-400" : "text-white"
              )}
            />
          ))}

        {text}
      </p>
    </button>
  );
};

// interface WebSocketClientProps {
//   lobbyState: LobbyState;
//   onClose: () => void;
//   sendEvent: (type: PlayerAction, payload: any) => void;
//   username: string;
// }

function GameClient({ id }: { id: string }) {
  const { lobbyState, sendEvent, gameState } = useLobbyContext();

  if (!lobbyState) {
    return <div>Loading...</div>;
  }

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
          ) : (
            //     <Button
            //   onClick={() => sendEvent(PlayerAction.CLOSE_LOBBY, "Close Lobby")}
            //   className="gap-1.5"
            //   variant="outline"
            // >
            //   <IconPower className="h-4 w-4 text-red-500" /> Shutdown
            // </Button>
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
        {gameState?.status === "active" && (
          <GameHeader
            round={gameState?.currentRound}
            totalRounds={gameState?.totalRounds}
            score={gameState?.scores[id] || 0}
            duration={gameState?.roundDuration}
            position="1st"
          />
        )}
        {gameState?.status === "active" && gameState.currentQuestion ? (
          <QuestionScreen />
        ) : gameState?.status === "completed" ? (
          <GameOverScreen />
        ) : (
          <WaitingScreen />
        )}
      </div>
    </div>
  );
}

export default GameClient;

interface GameHeaderProps {
  round: number;
  totalRounds: number;
  score: number;
  duration: number;
  position: string;
}

function GameHeader({
  round,
  totalRounds,
  score,
  duration,
  position,
}: GameHeaderProps) {
  let [count, setCount] = useState(duration);

  useEffect(() => {
    // This function runs only if count is greater than 0.
    const interval =
      count > 0 &&
      setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);

    // Cleanup function to clear interval.
    return () => clearInterval(interval);
  }, [count]); // Dependency on count to check it on each decrement.

  useEffect(() => {
    setCount(duration);
  }, [round]);

  return (
    <div className="w-full justify-between flex items-start">
      <div className="flex gap-1.5">
        <CountdownTimer count={count} />
        <div className="border text-xl border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
          {/* <Iconquestion className="h-4 w-4 text-yellow-500" /> */}
          {round + 1}/{totalRounds}
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
          <IconStarFilled className="h-4 w-4 text-blue-600" />
          {score}
        </div>
        <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center h-11 px-4 py-2 rounded-[var(--radius)] gap-1.5">
          <IconTrophyFilled className="h-4 w-4 text-yellow-500" />
          {position}
        </div>
      </div>
    </div>
  );
}

function QuestionScreen() {
  const { sendEvent, gameState } = useLobbyContext();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const handleAnswer = (id: string) => {
    setSelectedAnswer(id);
    sendEvent(PlayerAction.SUBMIT_ANSWER, id);
  };

  useEffect(() => {
    setSelectedAnswer(null);
  }, [gameState?.currentQuestion.id]);

  return (
    <div className="flex-1 flex flex-col justify-between p-2 w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${gameState?.currentQuestion.id}-question`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          className="flex-1 flex items-center justify-center text-5xl"
        >
          {gameState?.currentQuestion?.question}
        </motion.div>

        <motion.ul
          // key={`${gameState?.currentQuestion.id}-answers`}
          // initial={{ x: 1600, opacity: 0 }}
          // animate={{ x: 0, opacity: 1 }}
          // exit={{ x: -1600, opacity: 0 }}
          // transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          // exit={{ scaleY: 0.95, opacity: 0 }}
          // initial={{ scaleY: 0.95, opacity: 0 }}
          // animate={{ scaleY: 1, opacity: 1 }}
          // transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          // layout
          className={cn(
            " w-full gap-2 grid grid-cols-2",
            gameState?.currentQuestion?.answers.length > 2 && "grid-rows-2"
          )}
        >
          {gameState?.currentQuestion?.answers.map((answer, index) => (
            <Answer
              answerRevealed={gameState.answer}
              selected={selectedAnswer}
              key={answer.id}
              handleClick={handleAnswer}
              {...answer}
              correct={gameState?.answer === answer.id}
              index={index}
              color={(answerColors[index] as keyof typeof colors) || "sky"}
            />
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function WaitingScreen() {
  return (
    <div className="flex-1 flex flex-col justify-between p-2">
      <div className="flex-1 flex items-center justify-center text-5xl">
        Waiting for host to start the game...
      </div>
    </div>
  );
}

function GameOverScreen() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-2">
      <Podium />
    </div>
  );
}
