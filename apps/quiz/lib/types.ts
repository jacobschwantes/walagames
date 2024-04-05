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
  imageURL?: string
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




export type SetVisibility = "public" | "private" | "collaborators" | "friends";


export type SetCompletionStatus = {
  completed: number;
  total: number;
  in_progress: boolean;
};


export type TermTag = {
  id: string;
  tag: string;
};


export type Term = {
  id: string;
  owner_id: string;
  term: string;
  definition: string;
  tags: TermTag[];
  last_activity_at: Date;
  created_at: Date;
  updated_at: Date;
};


export type SetTag = {
  id: string;
  tag: string;
};


export type Set = {
  id: string;
  owner_id: string;
  collaborators: string[];
  name: string;
  description: string;
  image_url: string;
  tags: SetTag[];
  terms: Term[];
  visibility: SetVisibility;
  version: string;
  last_activity_at: Date;
  created_at: Date;
  updated_at: Date;
  likes: number;
  completion_status: SetCompletionStatus;
};