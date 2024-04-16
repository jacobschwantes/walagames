import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedContainer } from "@/components/container/animated-container";
import { fetchQuizById } from "@/actions/quiz";
import QuizPage from "@/components/quiz/quiz";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { quizID: string } }) {
  // const session = await getServerSession(authOptions);
  // const user = session?.user;
  const { quizID } = params;

  const res = await fetchQuizById(quizID);
  if ("error" in res) {
    redirect("/library");
  }

  return (
    <main className="w-full mx-auto h-full flex flex-col gap-5">
      <AnimatedContainer>
        <ScrollArea className=" h-[95vh]  max-w-6xl mx-auto w-full">
          <QuizPage initialData={res} />
        </ScrollArea>
      </AnimatedContainer>
    </main>
  );
}
