"use client";

import { createQuiz } from "@/actions/quiz";
import { Button } from "../ui/button";
import { PlusIcon, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const sample = {
  meta: {
    title: "Video Game Trivia & History",
    description:
      "Video Game History and fun Trivia for all ages to learn more about the video game industry and to test their knowledge on games, gaming consoles, companies, and developers.",
    category: "Technology",
    public: true,
    image: "/preview.jpg",
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
export function CreateQuizForm() {
  const router = useRouter();
  const handleCreateQuiz = async () => {
    const res = await createQuiz(sample);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    router.push(`/quiz/${res.id}`);
  };
  return (
    <form action={handleCreateQuiz}>
      <Button size="sm" variant="violet" className=" flex gap-0.5" type="submit">
        <PlusIcon className="h-4 w-4" />
        New Quiz
      </Button>
    </form>
  );
}

