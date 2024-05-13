import { z } from "zod";
export enum LobbyEvent {
  GAME_STATE = "GAME_STATE",
  LOBBY_STATE = "LOBBY_STATE",
  MESSAGE = "MESSAGE",
}

export enum PlayerAction {
  SUBMIT_ANSWER = "SUBMIT_ANSWER",
  START_GAME = "START_GAME",
  CLOSE_LOBBY = "CLOSE_LOBBY",
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

export type PlayerProfile = {
  id: string;
  username: string;
  image: string;
};

export type Player = {
  profile: PlayerProfile;
  role: PlayerRole;
  status: PlayerStatus;
};

export type LobbyState = {
  code: string;
  role: string;
  players: Player[];
};


const QuestionSchema = z.object({
  id: z.string(),
  // type: z.literal("multiple"), // Specify the exact value
  question: z.string(),
  answers: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      correct: z.boolean(),
    })
  ),
});

const FillInBlankQuestion = z.object({
  id: z.string(),
  type: z.literal("blank"), // Specify the exact value
  question: z.string(),
  answer: z.string(), // Only one answer, no options
});

// const QuestionSchema = z.discriminatedUnion("type", [
//   MultipleChoiceQuestion,
//   FillInBlankQuestion,
// ]);

export const QuizMetaSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    visibility: z.enum(["public", "private"]),
    image: z.string()
  })


export const QuizFormSchema = z.object({
  meta: QuizMetaSchema,
  questions: z.array(QuestionSchema),
});

export type QuizForm = z.infer<typeof QuizFormSchema>;

export type QuestionType = z.infer<typeof QuestionSchema>;
export type QuizMeta = z.infer<typeof QuizMetaSchema>;

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
