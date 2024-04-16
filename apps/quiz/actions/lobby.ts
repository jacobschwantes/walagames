"use server";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

type SuccessResponse = {
  server: string;
  token: string;
  username: string;
};

type ErrorResponse = {
  error: string;
};

type LobbyResponse = SuccessResponse | ErrorResponse;
/**
 * Initiates the creation of a lobby.
 * Calls the API to obtain a short-lived auth token and the realtime server endpoint.
 * The auth token and server endpoint are used for setting up the lobby WebSocket connection.
 *
 * @returns {Promise<LobbyResponse>} An object containing the server endpoint and the auth token,
 * or an error message if the session or user ID is missing.
 */
export const createLobby = async (): Promise<LobbyResponse> => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    console.error("no session");
    return { error: "no session" };
  }

  try {
    const response = await fetch(`${process.env.API_ENDPOINT}/lobby/host`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        userid: session.user.id,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unknown error");
    }
    return {...data, username: session.user.name}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// TODO: Create a join lobby action
// Need to figure out a better system that deduplicates logic
// Including system for handling the migration to the lobby each a host vs join case
// /lobby for actual lobby with /join?code= or /host

export const joinLobby = async (code: string): Promise<LobbyResponse> => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    console.error("no session");
    return { error: "no session" };
  }

  try {
    const response = await fetch(`${process.env.API_ENDPOINT}/lobby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        userid: session.user.id,
        code,
      }),
    });

    

    let data;
    if (response.ok) {
      data = await response.json();
    } else {
      throw new Error((await response.text()) || "Unknown error");
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
