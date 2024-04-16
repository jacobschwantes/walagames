import { z } from "zod";
export enum LobbyEvent {
  INITIAL_STATE = "INITIAL_STATE",
  NEW_MESSAGE = "NEW_MESSAGE",
  SERVER_MESSAGE = "SERVER_MESSAGE",
  PLAYER_JOIN = "PLAYER_JOIN",
  PLAYER_LEAVE = "PLAYER_LEAVE",
  GAME_STATE = "GAME_STATE",
  LOBBY_STATE = "LOBBY_STATE",
  PLAYER_LIST = "PLAYER_LIST",
}

export enum PlayerAction {
  JOIN_LOBBY = "JOIN_LOBBY",
  READY = "READY",
  UNREADY = "UNREADY",
  START_GAME = "START_GAME",
  SEND_MESSAGE = "SEND_MESSAGE",
  SUBMIT_ANSWER = "SUBMIT_ANSWER",
  PAUSE_GAME = "PAUSE_GAME",
  RESUME_GAME = "RESUME_GAME",
}

export enum PlayerRole {
  HOST = "host",
  PLAYER = "player",
}

export type Message = {
  username: string;
  imageURL?: string;
  message: string;
  timestamp: number;
};

export type Player = {
  id: string;
  username: string;
  role: PlayerRole;
  isReady: boolean;
  imageUrl: string;
};

export type LobbyState = {
  isConnected: boolean;
  exited: boolean;
  players: Player[];
  messages: Message[];
  gameState: Partial<GameState>;
};

type GameState = {
  code: string;
  players: {
    username: string;
    role: PlayerRole;
    imageURL?: string;
    score: number;
  }[];
  state: {
    question: "What is the capital of France?";
    answers: ["Paris", "London", "Berlin", "Madrid"];
    expiration: number;
    currentRound: number;
  };
  settings: {
    mode: string;
    totalRounds: number;
    roundLength: number;
  };
};

const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  answers: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      correct: z.boolean(),
    })
  ),
});

export const QuizFormSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    public: z.boolean(),
    image: z.object({
      src: z.string(),
      meta: z
        .object({
          color: z.object({
            r: z.number(),
            g: z.number(),
            b: z.number(),
          }),
        })
        .optional(),
    }),
  }),
  questions: z.array(QuestionSchema),
});

export type QuizForm = z.infer<typeof QuizFormSchema>;

export type Question = z.infer<typeof QuestionSchema>;

export type Quiz = QuizForm & {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  stats: {
    plays: number;
    stars: number;
    // rating: number;
  };
};
