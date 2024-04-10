import { fetchQuizMany } from "@/actions/quiz";
import { AnimatedContainer } from "@/components/container/animated-container";
import { QuizForm } from "@/components/quiz/quiz-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  // const session = await getServerSession(authOptions);
  // console.log(session);
  // const sessionToken = session.sessionToken;

  const res = await fetchQuizMany({});
  if ("error" in res) {
    return <div>{res.error}</div>;
  }
  const quizList = res.data.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));

  return (
    <div className=" w-full mx-auto h-full flex flex-col gap-5 ">
      <AnimatedContainer direction="down">
        <ScrollArea className=" h-[99vh] max-w-[1400px] mx-auto w-full px-5">
          <div className="flex justify-between sticky top-0 z-50 p-2 pt-4 bg-[#1a1e24]">
            <h1 className="text-2xl">My Library</h1>
            <QuizForm />
          </div>
          <ul className="grid grid-cols-3 gap-4 my-2 mx-2">
            {quizList &&
              quizList.map((quiz) => (
                <Link
                  className="w-full flex flex-col  bg-[#242a32] rounded-xl  hover:-translate-y-0.5 hover:scale-[1.01] transition-all ease-out duration-300 group "
                  href={`/quiz/${quiz.id}`}
                  key={quiz.id}
                >
                  <div className="w-full relative ">
                    <div className="flex  justify-between absolute bottom-0 right-0 left-0 p-2 z-20">
                      <p className="text-xs text-white px-2 py-1 bg-[#242a32]/90 border-[#242a32]  rounded-lg">
                        {quiz.meta.category}
                      </p>
                    </div>

                    <div className="relative w-full aspect-[16/8]  rounded-t-xl  overflow-hidden">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950  to-transparent opacity-75"></div>
                      <Image
                        objectFit="cover"
                        className="group-hover:brightness-110 transition-all duration-300"
                        alt="preview image"
                        fill
                        // TODO: set these sizes for performance
                        // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={quiz.meta.image_src}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1  p-3 px-4">
                    <h2 className="text-lg">{quiz.meta.title}</h2>
                    <div className="flex justify-between">
                      <p className=" text-zinc-300 text-xs">
                        {quiz.questions.length} Question
                        {quiz.questions.length > 1 && "s"}
                      </p>
                      <div className="flex gap-2 items-center">
                        <p className="text-zinc-300 tracking-wide text-xs flex items-center gap-1">
                          <svg className="h-2 w-2 " viewBox="0 0 448 512">
                            <path
                              fill="currentColor"
                              d="m424.4 214.7-352-208.1c-28.6-16.9-72.4-.5-72.4 41.3v416.1c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                            />
                          </svg>
                          {quiz.stats.plays + Math.floor(Math.random() * 1000)}
                        </p>
                        <p className="text-zinc-300 tracking-wide text-xs flex items-center gap-1">
                          <svg
                            fill="currentColor"
                            className="h-3 w-3 "
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m16.44 3.10156c-1.81 0-3.43.88-4.44 2.23-1.01-1.35-2.63-2.23-4.44-2.23-3.07 0-5.56 2.5-5.56 5.59 0 1.19.19 2.29004.52 3.31004 1.58 5 6.45 7.99 8.86 8.81.34.12.9.12 1.24 0 2.41-.82 7.28-3.81 8.86-8.81.33-1.02.52-2.12004.52-3.31004 0-3.09-2.49-5.59-5.56-5.59z"
                              fill="currentColor"
                            />
                          </svg>
                          {quiz.stats.plays + Math.floor(Math.random() * 1000)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </ul>
        </ScrollArea>
      </AnimatedContainer>
    </div>
  );
}
