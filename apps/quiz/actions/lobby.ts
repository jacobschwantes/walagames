"use server";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

type SuccessResponse = {
  token: string;
  endpoint: string;
  code: string
};

type ErrorResponse = {
  error: string;
};

type LobbyResponse = SuccessResponse | ErrorResponse;

export const createLobby = async (quizID: string): Promise<LobbyResponse> => {
  const endpoint = "localhost:8081";

  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("no session");
    return { error: "no session" };
  }

  try {
    const response = await fetch(`http://${endpoint}/host`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        user: {
          id: session.user.id,
          username: session.user?.name,
          image: session.user.image,
        },
        quizID,
      }),
    });

    if (!response.ok) {
      const res = await response.text();
      console.log(res);
      throw new Error(res);
    }

    const { token, code } = await response.json();

    return {
      token,
      endpoint,
      code
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const joinLobby = async (code: string): Promise<LobbyResponse> => {
  const endpoint = "localhost:8081";

  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("no session");
    return { error: "no session" };
  }

  try {
    const response = await fetch(`http://${endpoint}/join/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        user: {
          id: session.user.id,
          username: session.user?.name,
          image: session.user.image,
        },
      }),
    });

    if (!response.ok) {
      const res = await response.text();
      console.log(res);
      throw new Error(res);
    }

    const { token } = await response.json();

    return {
      token,
      endpoint,
      code
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
