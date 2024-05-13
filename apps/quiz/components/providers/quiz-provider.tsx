"use client";
import { updateQuiz } from "@/actions/quiz";
import { uploadImage } from "@/actions/upload";
import { QuestionType, Quiz, QuizMeta } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { isEqual } from "lodash";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

interface QuizContextType {
  state: {
    quiz: Quiz;
    imageData: File | null;
    imageDataUrl: string | null;
  };
  dispatch: (action: any) => void;
  handleSaveQuestions: () => void;
  handleSaveMeta: (meta: QuizMeta, imageData: File | null) => void;
}

const defaultContextValue: QuizContextType = {
  state: {
    quiz: {
      id: "",
      owner_id: "",
      created_at: "",
      updated_at: "",
      stats: {
        plays: 0,
        stars: 0,
      },
      meta: {
        title: "",
        description: "",
        category: "",
        image: "",
        visibility: "private",
      },
      questions: [],
    },
    imageData: null,
    imageDataUrl: null,
  },
  dispatch: () => {},
  handleSaveQuestions: () => { },
  handleSaveMeta: () => { },
};
const QuizContext = createContext<QuizContextType>(defaultContextValue);

export const useQuizContext = () => useContext(QuizContext);

function reducer(state: any, action: any) {
  switch (action.type) {
    case "SET_QUIZ":
      return { ...state, quiz: action.payload };
    case "SET_IMAGE_DATA":
      return { ...state, imageData: action.payload };
    case "SET_IMAGE_DATA_URL":
      return { ...state, imageDataUrl: action.payload };
    case "REORDER_QUESTIONS":
      console.log(action);
      return { ...state, quiz: { ...state.quiz, questions: action.payload } };
    case "DELETE_QUESTION":
      return {
        ...state,
        quiz: {
          ...state.quiz,
          questions: state.quiz.questions.filter(
            (q: QuestionType) => q.id !== action.payload
          ),
        },
      };
    case "SET_QUESTION":
      return {
        ...state,
        quiz: {
          ...state.quiz,
          questions: state.quiz.questions.map((q: QuestionType) =>
            q.id === action.payload.id ? action.payload : q
          ),
        },
      };
    default:
      return state;
  }
}

export const QuizProvider = ({
  children,
  quiz,
}: {
  children: React.ReactNode;
  quiz: Quiz;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    quiz,
  });

  const router = useRouter();
  const pathname = usePathname();

  async function handleSaveMeta(meta: QuizMeta, imageData: File | null) {
    if (isEqual(state.quiz.meta, meta)) return;
    const newQuiz = { ...state.quiz, meta };

    if (imageData) {
      console.log("Uploading image");
      const formData = new FormData();
      formData.append("file", imageData);

      const res = await uploadImage(formData);
      if ("error" in res) {
        console.log("Error uploading image");
        return;
      }
      newQuiz.meta.image = res.src;
    }

    const res = await updateQuiz(quiz.id, newQuiz);
    if ("error" in res) {
      console.log("Error saving quiz:", res.error);
      return;
    }

    dispatch({ type: "SET_QUIZ", payload: res });
  }

  async function handleSaveQuestions() {
    if (isEqual(state.quiz.questions, quiz.questions)) {
      router.push(pathname);
      return;
    }

    const res = await updateQuiz(quiz.id, state.quiz);
    if ("error" in res) {
      console.log("Error saving quiz:", res.error);
      return;
    }

    dispatch({ type: "SET_QUIZ", payload: res });
    router.push(pathname);
  }

  return (
    <QuizContext.Provider
      value={{
        state,
        dispatch,
        handleSaveQuestions,
        handleSaveMeta,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
