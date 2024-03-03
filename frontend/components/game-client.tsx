"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { useLobby } from "@/hooks/lobby";
import { Message, PlayerAction, PlayerRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GearIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "next-auth";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { twMerge } from "tailwind-merge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface WebSocketClientProps {
  connectionStr: string;
  onClose: () => void;
  username: string;
}

const GameClient: React.FC<WebSocketClientProps> = ({
  connectionStr,
  onClose,
  username,
}) => {
  const [lobbyState, sendEvent] = useLobby(connectionStr);
  const [messageInput, setMessageInput] = useState<string>("");
  const [submittedAnswer, setSubmittedAnswer] = useState<string>("");

  const role = useMemo(
    () =>
      lobbyState.gameState?.players?.find((p) => p.username === username)?.role,
    [lobbyState.gameState.players, username]
  );

  useEffect(() => {
    setSubmittedAnswer("");
  }, [lobbyState.gameState.state?.question]);

  const sendMessage = (data: z.infer<typeof ChatWindowSchema>) => {
    sendEvent(PlayerAction.SEND_MESSAGE, data.message);
  };

  const submitAnswer = (answer: string) => {
    setSubmittedAnswer(answer);
    sendEvent(PlayerAction.SUBMIT_ANSWER, answer);
  };

  // // TODO: implement optimisitc updates, show message as soon as it's sent
  // const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   sendMessage(messageInput);
  //   setMessageInput("");
  // };

  useEffect(() => {
    if (lobbyState.exited) {
      onClose();
    }
  }, [lobbyState.exited, onClose]);

  return (
    <div className="flex-1 flex flex-col justify-between h-full w-full gap-2 py-6 ">
      <div className="w-full">
        <h2>Lobby code: {lobbyState.gameState.code}</h2>

        <div className="flex w-full justify-between">
          <h2 className="text-2xl font-medium">
            Round {lobbyState.gameState.state?.currentRound} of{" "}
            {lobbyState.gameState.settings?.totalRounds}
          </h2>
          <GearIcon className="h-7 w-7 text-zinc-900" />
        </div>
      </div>

      <div className="flex w-full flex-1 gap-2 ">
        <div className="grid gap-2 max-w-[16rem] w-full">
          <div className="flex-1 flex flex-co border rounded-lg p-2">
            <h2 className="font-medium">Questions</h2>
          </div>
          <div className="flex min-h-full flex-col border rounded-lg p-2 max-w-xs w-full flex-1 gap-2">
            <h2 className="font-medium">Leaderboard</h2>
            <ol className="gap-2 flex flex-col">
              {lobbyState.gameState.players &&
                lobbyState.gameState.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, idx) => (
                    <li
                      className="flex items-center gap-2 justify-between"
                      key={player.username}
                    >
                      <h3 className="flex items-center gap-2 text-sm">
                        <Avatar
                          className={twMerge(
                            "font-medium text-zinc-600 h-6 w-6 flex items-center justify-center aspect-square rounded-full border-2 ",
                            idx === 0 && "border-yellow-400",
                            idx === 1 && "border-gray-400",
                            idx === 2 && "border-orange-800"
                          )}
                        >
                          <AvatarImage
                            alt="avatar"
                            src={
                              player.imageURL ||
                              `https://api.dicebear.com/7.x/notionists/svg?seed=${player.username}`
                            }
                          />
                          <AvatarFallback className="text-xs">
                            JS
                          </AvatarFallback>
                          {/* {idx + 1} */}
                        </Avatar>
                        {player.username === username ? "You" : player.username}
                      </h3>
                      <span className="block text-sm">{player.score}</span>
                    </li>
                  ))}
            </ol>
          </div>
        </div>
        {lobbyState.gameState.state?.question ? (
          <div className="flex-1 border rounded-lg flex flex-col gap-16 justify-between p-6">
            <div className="flex-1 flex flex-col  items-center gap-6">
              <div className=" flex flex-col justify-center h-16">
                <CountdownTimer
                  targetDate={lobbyState.gameState.state.expiration}
                />
              </div>
              <div className="w-full aspect-video border mx-auto flex items-center justify-center rounded-lg shadow-lg shadow-zinc-100 border-zinc-100">
                <h2 className="text-3xl font-medium">
                  {lobbyState.gameState.state?.question}
                </h2>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-2">
              {lobbyState.gameState.state?.answers.map((answer, index) => (
                <Button
                  disabled={submittedAnswer !== ""}
                  key={answer}
                  onClick={() => submitAnswer(answer)}
                  className={twMerge(
                    "h-16 hover:bg-black hover:text-white transition-colors duration-200",
                    answer === submittedAnswer
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-black"
                  )}
                >
                  {answer}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 border rounded-lg flex flex-col gap-16 justify-between p-6">
            {role === PlayerRole.HOST ? (
              <div>
                <Button
                  onClick={() => sendEvent(PlayerAction.START_GAME, "merch")}
                >
                  Start Game
                </Button>
              </div>
            ) : (
              <h2>Waiting for the host to start the game...</h2>
            )}
          </div>
        )}
        <ChatWindow
          playerCount={lobbyState?.gameState?.players?.length || 0}
          username={username}
          onSubmit={sendMessage}
          messages={lobbyState.messages}
        />
      </div>
    </div>
  );
};

export default GameClient;

interface LobbyEntranceProps {
  user?: User;
}
export const LobbyEntrance: React.FC<LobbyEntranceProps> = ({ user }) => {
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [connnectionStr, setConnectionStr] = useState("");
  const [username, setUsername] = useState(user?.name || "");

  useEffect(() => {
    if (connnectionStr && !lobbyOpen) {
      setLobbyOpen(true);
    }
  }, [connnectionStr]);

  const handleCreateLobby = async (
    data: z.infer<typeof CreateLobbyFormSchema>
  ) => {
    const { otc } = await fetch("http://localhost:3000/api/auth/otc")
      .then((res) => res.json())
      .catch((e) => {
        toast.error("Failed to create lobby. Please try again.");
      });
    setConnectionStr(`ws://localhost:8080/ws?otc=${otc}`);
    setLobbyOpen(true);
  };

  const handleJoinLobby = async (data: z.infer<typeof JoinLobbyFormSchema>) => {
    if (user) {
      const { otc } = await fetch("http://localhost:3000/api/auth/otc")
        .then((res) => res.json())
        .catch((e) => {
          toast.error("Failed to create lobby. Please try again.");
        });
      setConnectionStr(
        `ws://localhost:8080/ws?otc=${otc}&lobby=${data.lobbyCode}`
      );
    } else {
      setConnectionStr(
        `ws://localhost:8080/ws?lobby=${data.lobbyCode}&username=${data.username}`
      );
      setUsername(data.username);
    }

    setLobbyOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {lobbyOpen ? (
        <GameClient
          onClose={() => {
            setLobbyOpen(false);
            setConnectionStr("");
          }}
          connectionStr={connnectionStr}
          username={username}
        />
      ) : (
        <div className="flex flex-col gap-y-6 divide-y-2 max-w-lg mx-auto items-center w-full">
          <div className="w-full">
            <h1 className="text-3xl font-bold">Quiz Game</h1>
            <p>Please join a lobby or create a new one to start playing.</p>
          </div>
          <JoinLobbyForm onSubmit={handleJoinLobby} username={username} />
          <CreateLobbyForm onSubmit={handleCreateLobby} />
        </div>
      )}
    </div>
  );
};

const JoinLobbyFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  lobbyCode: z.string().min(4, {
    message: "Lobby code must be 4 characters.",
  }),
});

interface JoinLobbyFormProps {
  onSubmit: (data: z.infer<typeof JoinLobbyFormSchema>) => void;
  username?: string;
}

const JoinLobbyForm: React.FC<JoinLobbyFormProps> = ({
  onSubmit,
  username,
}) => {
  const form = useForm<z.infer<typeof JoinLobbyFormSchema>>({
    resolver: zodResolver(JoinLobbyFormSchema),
    defaultValues: {
      username: username || "",
      lobbyCode: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full gap-y-6 py-6"
      >
        {!username && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="User123" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="lobbyCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lobby Code</FormLabel>
              <FormControl>
                <Input placeholder="XXXX" {...field} />
              </FormControl>
              <FormDescription>
                This is the code for the lobby you want to join.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Join</Button>
      </form>
    </Form>
  );
};
const CreateLobbyFormSchema = z.object({
  lobbyName: z.string().min(2, {
    message: "Lobby name must be at least 2 characters.",
  }),
});

interface CreateLobbyFormProps {
  onSubmit: (data: z.infer<typeof CreateLobbyFormSchema>) => void;
  username?: string;
}

const CreateLobbyForm: React.FC<CreateLobbyFormProps> = ({
  onSubmit,
  username,
}) => {
  const form = useForm<z.infer<typeof CreateLobbyFormSchema>>({
    resolver: zodResolver(CreateLobbyFormSchema),
    defaultValues: {
      lobbyName: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-y-6 py-6 w-full"
      >
        <FormField
          control={form.control}
          name="lobbyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lobby Name</FormLabel>
              <FormControl>
                <Input placeholder="My Lobby" {...field} />
              </FormControl>
              <FormDescription>
                This is the name for the lobby you want to create.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};

const ChatWindowSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 character.",
  }),
});
interface ChatWindowProps {
  username?: string;
  onSubmit: (data: z.infer<typeof ChatWindowSchema>) => void;
  messages: Message[];
  playerCount?: number;
}
const ChatWindow: React.FC<ChatWindowProps> = ({
  onSubmit,
  messages,
  username,
  playerCount,
}) => {
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const form = useForm({
    defaultValues: {
      message: "",
    },
  });
  const handleSubmit = (data: z.infer<typeof ChatWindowSchema>) => {
    onSubmit(data);
    form.reset();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="flex flex-col border rounded-lg p-2 max-w-xs w-full gap-1 flex-1">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <div className="relative flex items-center h-2.5 w-2.5">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-ping absolute z-10 block "></span>
            <span className="h-2 w-2 rounded-full bg-green-400  absolute  block "></span>
          </div>
          <span className="flex items-center gap-2">
            {/* <PersonIcon className="h-3 w-3" /> */}
            <p className="font-medium text-xs">
              {playerCount} Player{playerCount && playerCount > 1 && "s"}{" "}
              Connected
            </p>
          </span>
        </div>
      </div>
      {/* TODO: fix this hard coded viewport size */}
      <ScrollArea className=" h-[75vh] overflow-hidden ">
        <ul className=" flex flex-col gap-2 w-full h-full ">
          {messages.map((message, index) =>
            message.username === "Server" ? (
              <ServerMessage
                key={message.message + index}
                message={message.message}
              />
            ) : (
              <ChatMessage
                key={message.message + index}
                message={message}
                username={username}
              />
            )
          )}
          <div ref={chatEndRef} />
        </ul>
      </ScrollArea>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid w-full gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Type your message here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const ServerMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <li>
      <p className="text-xs text-gray-500 font-medium text-center italic">
        {message}
      </p>
    </li>
  );
};

const ChatMessage: React.FC<{ message: Message; username: string }> = ({
  message,
  username,
}) => {
  return (
    <li className="text-black flex flex-col gap-1">
      <div className="flex w-full items-center">
        <div
          className={twMerge(
            "flex gap-1 items-center",
            message.username === username
              ? "order-2 flex-row-reverse"
              : "order-1"
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage
              alt="avatar"
              src={
                message.imageURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${message.username}`
              }
            />
            <AvatarFallback className="text-xs">JS</AvatarFallback>
          </Avatar>
          <h3 className="text-xs">
            {message.username === username ? "You" : message.username}
          </h3>
        </div>
        <p
          className={twMerge(
            "text-xs text-zinc-500 whitespace-nowrap flex-1",
            message.username === username ? "text-left" : "text-right order-2"
          )}
        >
          {new Date(message.timestamp * 1000).toLocaleTimeString("en-US", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div
        className={twMerge(
          "  rounded-lg  p-2 w-3/4",
          message.username === username
            ? "ml-auto rounded-tr-none bg-black text-white"
            : "mr-auto rounded-tl-none bg-zinc-100"
        )}
      >
        <p className="text-xs">{message.message}</p>
      </div>
    </li>
  );
};

function calculateTimeLeft(target: number) {
  const difference = target * 1000 - Date.now();
  let timeLeft;

  if (difference > 0) {
    timeLeft = Math.floor((difference / 1000) % 60);
  }

  return timeLeft;
}
interface CountdownTimerProps {
  targetDate: number;
}
const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  const totalSeconds = useMemo(() => {
    const time = calculateTimeLeft(targetDate);
    return {
      id: Math.floor(Math.random() * 1000),
      seconds: time,
    };
  }, [targetDate]);

  useEffect(() => {
    // Update the time left every second
    setTimeLeft(calculateTimeLeft(targetDate));
  }, [targetDate]);

  useEffect(() => {
    // Update the time left every second

    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(targetDate));
      }, 1000);

      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  });

  // Helper function to calculate time left until target date

  return (
    <div className="relative w-16 flex justify-center items-center">
      <div className="countdown-timer">
        <div className="countdown-timer__circle">
          <svg>
            <circle className="inactive" r="24" cx="26" cy="26" />
            <circle
              key={totalSeconds.id}
              className="active"
              r="24"
              cx="26"
              cy="26"
              style={{
                animation: `countdown-animation ${totalSeconds.seconds}s linear`,
              }}
            />
          </svg>
        </div>

        <span className="countdown-timer__text">{timeLeft}</span>
      </div>
    </div>
  );
};
