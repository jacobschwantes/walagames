"use server";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { Quiz, QuizForm, QuizFormSchema } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ErrorResponse = {
  error: string;
};

type FetchQuizManyOptions = {
  limit?: number;
  offset?: number;
};

const getUserID = async (): Promise<string> => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("no session");
  }
  return session.user.id;
};

/**
 * Creates a quiz.
 * Calls the API to create a quiz.
 *
 * @param {QuizForm} formData The form data for the quiz to create.
 * @returns {Promise<Quiz>} An object containing the quiz object or an error message.
 */
export const createQuiz = async (
  formData: unknown
): Promise<Quiz | ErrorResponse> => {
  const quiz = QuizFormSchema.safeParse(formData);
  if (!quiz.success) {
    let errorMessage = "";
    quiz.error.issues.forEach((issue) => {
      errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
    });
    return { error: errorMessage };
  }

  try {
    const userid = await getUserID();
    const response = await fetch(
      `${process.env.API_ENDPOINT}/quiz?user_id=${userid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          ...quiz.data,
        }),
      }
    );

    const data = await response.json();
    console.log("createQuiz", data);

    revalidatePath("/library");
    return data;
    // if (!response.ok) {
    //   throw new Error(data.error || "Unknown error");
    // }
    // return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Fetches a quiz by id.
 * Calls the API to fetch a quiz.
 *
 * @param {string} id The quiz ID to fetch.
 * @returns {Promise<Quiz>} An object containing the quiz object or an error message.
 */
export const fetchQuizById = async (
  id: string
): Promise<Quiz | ErrorResponse> => {
  try {
    const userid = await getUserID();
    const response = await fetch(
      `${process.env.API_ENDPOINT}/quiz?id=${id}&user_id=${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        //   body: JSON.stringify({
        //     userid,
        //   }),
      }
    );
    if (!response.ok) {
      throw new Error((await response.text()) || "Unknown error");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

type FetchQuizManyResponse = {
  data: Quiz[];
};
/**
 * Fetches many quizzes.
 * Calls the API to fetch many quizzes.
 *
 * @param {FetchQuizManyOptions} options The options to fetch quizzes.
 * @returns {Promise<FetchQuizManyResponse>} An array containing the quiz objects or an error message.
 */
export const fetchQuizMany = async (
  options: FetchQuizManyOptions
): Promise<FetchQuizManyResponse | ErrorResponse> => {
  try {
    const userid = await getUserID();
    const response = await fetch(
      `${process.env.API_ENDPOINT}/quizzes?user_id=${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unknown error");
    }
    return {
      data: result,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Updates a quiz.
 * Calls the API to update a quiz.
 *
 * @param {string} id The quiz ID to update.
 * @param {QuizForm} formData The form data for the quiz to update.
 * @returns {Promise<Quiz>} An object containing the quiz object or an error message.
 */
export const updateQuiz = async (
  id: string,
  formData: unknown
): Promise<Quiz | ErrorResponse> => {
  if (!id) {
    return { error: "no quiz id" };
  }
  console.log("updateQuiz", id, formData);
  const quiz = QuizFormSchema.safeParse(formData);
  if (!quiz.success) {
    let errorMessage = "";
    quiz.error.issues.forEach((issue) => {
      errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
    });
    return { error: errorMessage };
  }

  try {
    const userid = await getUserID();
    const response = await fetch(
      `${process.env.API_ENDPOINT}/quiz?id=${id}&user_id=${userid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          ...quiz.data,
        }),
      }
    );
    revalidatePath(`/library/quiz/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unknown error");
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Deletes a quiz.
 * Calls the API to delete a quiz.
 *
 * @param {string} id The quiz ID to delete.
 * @returns {Promise<Quiz>} An object containing the quiz object or an error message.
 */
export const deleteQuiz = async (id: string): Promise<Quiz | ErrorResponse> => {
  try {
    const userid = await getUserID();
    const response = await fetch(`${process.env.API_ENDPOINT}/quiz/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        userid,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unknown error");
    }
    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
