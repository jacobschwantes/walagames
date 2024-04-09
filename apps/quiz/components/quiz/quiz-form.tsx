"use client";

import { createQuiz } from "@/actions/quiz";
import { Button } from "../ui/button";
import { PushButton } from "../ui/custom-button";
import { PencilLine } from "lucide-react";
const sample = {
  meta: {
    title: "Video Game Trivia & History",
    description:
      "Video Game History and fun Trivia for all ages to learn more about the video game industry and to test their knowledge on games, gaming consoles, companies, and developers.",
    category: "Technology",
    public: true,
    image_src: "/preview4.jpg",
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
  };
  return (
    <form action={handleCreateQuiz}>
      <PushButton className="text-sm" color="violet" type="submit">
       <PencilLine className="h-4 w-4 mr-1"/> Create Quiz
      </PushButton>
    </form>
  );
};
