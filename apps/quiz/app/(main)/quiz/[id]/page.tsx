import { AnimatedContainer } from "@/components/container/animated-container";
import { fetchQuizById } from "@/actions/quiz";
import { redirect } from "next/navigation";
import GameOptions from "@/components/game/game-options";
import { QuizProvider } from "@/components/providers/quiz-provider";
import { QuizHeader } from "@/components/quiz/quiz-header";
import { QuestionList } from "@/components/quiz/question-list";
import { QuizBreadcrumb } from "@/components/quiz/quiz-breadcrump";

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function Page({ params, searchParams }: PageProps) {
  const { id } = params;
  const { play } = searchParams;

  const quiz = await fetchQuizById(id);
  if ("error" in quiz) {
    redirect("/library");
  }

  const activePath = quiz.meta.title;

  return (
    <main className="w-full  h-full flex flex-col mx-auto py-5 max-w-[71rem]">
      <QuizBreadcrumb
        activePath={activePath}
        crumbs={[{ name: "Library", href: "/library" }]}
      />
      {/* {play != null ? (
        <AnimatedContainer key="options" direction="down">
          <GameOptions quiz={quiz} />
        </AnimatedContainer>
      ) : ( */}
        <AnimatedContainer key="quiz">
          <QuizProvider quiz={quiz}>
            <QuizHeader />
            <QuestionList />
          </QuizProvider>
        </AnimatedContainer>
    
    </main>
  );
}
