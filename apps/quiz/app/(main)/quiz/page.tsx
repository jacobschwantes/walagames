import { createQuiz, fetchQuizMany } from "@/actions/quiz";
import { QuizForm } from "@/components/quiz/quiz-form";
import Link from "next/link";

export default async function Page() {
  // const session = await getServerSession(authOptions);
  // console.log(session);
  // const sessionToken = session.sessionToken;
  const res = await fetchQuizMany({});
  if ("error" in res) {
    return <div>{res.error}</div>;
  }
  const quizzez = res.data;

  return (
    <div>
      TODO - IDK what to do here
      {/* <h1>Sets</h1>
      <QuizForm />
      <ul className="grid grid-cols-4 gap-4">
        {quizzez && quizzez.map((quiz) => (
          <Link
            className=" h-56 w-full bg-popover rounded-lg p-4"
            href={`/library/quiz/${quiz.id}`}
            key={quiz.id}
          >
            <h2 className="text-xl text-white">{quiz.meta.title}</h2>
            <p className="text-zinc-300">{quiz.meta.description}</p>
          </Link>
        ))}
      </ul> */}
    </div>
  );
}
