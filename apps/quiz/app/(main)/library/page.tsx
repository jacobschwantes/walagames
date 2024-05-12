import { fetchQuizMany } from "@/actions/quiz";
import { fetchUserProfilesByIds } from "@/actions/user";
import { AnimatedContainer } from "@/components/container/animated-container";
import QuizCard from "@/components/quiz/quiz-card";
import { QuizForm } from "@/components/quiz/quiz-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Quiz } from "@/lib/types";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const quizzes = await fetchQuizMany({});
  if ("error" in quizzes) {
    return <div>{quizzes.error}</div>;
  }

  const ownerIds = [...new Set(quizzes.data.map((q) => q.owner_id))];

  const profiles = await fetchUserProfilesByIds(ownerIds);
  if ("error" in profiles) {
    return <div>{profiles.error}</div>;
  }

  const sorted = quizzes.data.sort(
    (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)
  );

  console.log("running again")

  return (
    <div className=" w-full mx-auto h-full flex flex-col gap-5 ">
      <div className="flex justify-between items-center sticky top-0 z-50 py-4 bg-[#1a1e24]">
        <h1 className="text-2xl">My Library</h1>
        <QuizForm />
      </div>
      <ul className="grid grid-cols-4 gap-3">
        {sorted.map((quiz, i) => (
          <QuizCard
            profile={profiles.data[quiz.owner_id]}
            quiz={quiz}
          />
        ))}
      </ul>
    </div>
  );
}
