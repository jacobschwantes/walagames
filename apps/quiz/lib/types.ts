import { z } from "zod";
export enum LobbyEvent {
  GAME_STATE = "GAME_STATE",
  LOBBY_STATE = "LOBBY_STATE",
  MESSAGE = "MESSAGE",
}

export enum PlayerAction {
  SUBMIT_ANSWER = "SUBMIT_ANSWER",
  START_GAME = "START_GAME",
}

export enum PlayerRole {
  HOST = "HOST",
  PLAYER = "PLAYER",
}

export enum PlayerStatus {
  JOINING = "JOINING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  KICKED = "KICKED",
}

export type Player = {
  id: string;
  role: PlayerRole;
  username: string;
  image: string;
  status: PlayerStatus;
};

export type LobbyState = {
  code: string
  players: Player[];
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
