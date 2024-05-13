"use client";
import { Quiz } from "@/lib/types";
import QuizCard from "./quiz-card";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { CreateQuizForm } from "./quiz-forms";
import { useState } from "react";

export function Quizzes({
  quizzes,
  profiles,
}: {
  quizzes: Quiz[];
  profiles: any;
}) {
  const [search, setSearch] = useState("");

  const filtered = quizzes.filter((quiz) =>
    quiz.meta.title.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = filtered.sort(
    (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)
  );
  return (
    <>
      <div className="flex justify-between items-center sticky top-0 z-50 bg-[#1a1e24] py-3">
        <div className="flex w-full max-w-md items-center space-x-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full  shadow-none appearance-none pl-8 md:w-full lg:w-full "
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
        <CreateQuizForm />
      </div>
      <ul className="grid grid-cols-4 gap-3">
        {sorted.map((quiz, i) => (
          <QuizCard profile={profiles[quiz.owner_id]} quiz={quiz} />
        ))}
      </ul>
    </>
  );
}
