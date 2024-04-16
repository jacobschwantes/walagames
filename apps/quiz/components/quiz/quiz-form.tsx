"use client";

import { createQuiz } from "@/actions/quiz";
import { Button } from "../ui/button";
import { PushButton } from "../ui/custom-button";
import { ChevronRight, PencilLine, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
const sample = {
  meta: {
    title: "Video Game Trivia & History",
    description:
      "Video Game History and fun Trivia for all ages to learn more about the video game industry and to test their knowledge on games, gaming consoles, companies, and developers.",
    category: "Technology",
    public: true,
    image: {
      src: "/preview.jpg",
      meta: {
        color: {
          r: 166,
          g: 188,
          b: 221,
        },
      },
    },
  },
  questions: [
    {
      id: "1",
      question: "What was the first commercially successful video game?",
      answers: [
        {
          id: "1",
          text: "Pong",
          correct: false,
        },
        {
          id: "2",
          text: "Space Invaders",
          correct: false,
        },
        {
          id: "3",
          text: "Tetris",
          correct: false,
        },
        {
          id: "4",
          text: "IDK",
          correct: true,
        },
      ],
    },
  ],
};
export const QuizForm = () => {
  const handleCreateQuiz = async () => {
    const res = await createQuiz(sample);
    console.log(res);
    redirect(`/quiz/${res.id}`);
  };
  return (
    <form action={handleCreateQuiz}>
      <Button
        variant="violet"
        // size="lg"
        className=" flex gap-0.5"
        type="submit"
      >
        {/* <span className="p-0.5 rounded-full bg-violet-300/30 mr-1"> */}
          {/* <ChevronRight className="h-3 w-3" /> */}
          <PlusIcon className="h-4 w-4" />
        {/* </span> */}
        New Quiz
      </Button>
    </form>
  );
};
