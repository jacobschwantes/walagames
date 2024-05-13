import { fetchQuizMany } from "@/actions/quiz";
import { fetchUserProfilesByIds } from "@/actions/user";
import { Quizzes, LibraryHeader } from "@/components/quiz/quizzes";

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

  return (
    <div className=" w-full mx-auto h-full flex flex-col">
    
      <Quizzes quizzes={quizzes.data} profiles={profiles.data} />
    </div>
  );
}
