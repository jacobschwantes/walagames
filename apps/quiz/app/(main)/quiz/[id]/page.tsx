import { AnimatedContainer } from "@/components/container/animated-container";
import { fetchQuizById } from "@/actions/quiz";
import QuizPage from "@/components/quiz/quiz";
import { redirect } from "next/navigation";
import GameOptions from "@/components/game/game-options";
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

  return (
    <main className="w-full mx-auto h-full flex flex-col gap-5 p-5 max-w-6xl">
      {play != null ? (
        <AnimatedContainer key="options" direction="down">
          <GameOptions quiz={quiz} />
        </AnimatedContainer>
      ) : (
        <AnimatedContainer key="quiz">
            <QuizPage initialData={quiz} />
        </AnimatedContainer>
      )}
    </main>
  );
}
